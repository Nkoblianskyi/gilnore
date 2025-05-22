"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import DisclaimerModal from "@/components/disclaimer-modal"
import { Gem, Shovel, Skull, Bomb, Coins, Scroll } from "lucide-react"

// A mezőn található elemek típusai
type ItemType = "műtárgy" | "kincs" | "koponya" | "bomba" | "érmék" | "tekercs"

// Játékmező cellájának interfésze
interface Cell {
  id: number
  revealed: boolean
  type: ItemType
  points: number
  isShuffling?: boolean
  revealOrder?: number | null
}

// Játék konfigurációs interfésze
interface GameConfig {
  rows: number
  cols: number
  itemDistribution: Record<ItemType, number>
  pointsMap: Record<ItemType, number>
  revealCount: number
}

export default function GamePage() {
  // Játék konfiguráció
  const gameConfig: GameConfig = {
    rows: 5,
    cols: 5,
    itemDistribution: {
      műtárgy: 5,
      kincs: 3,
      koponya: 2,
      bomba: 2,
      érmék: 3,
      tekercs: 10,
    },
    pointsMap: {
      műtárgy: 50,
      kincs: 100,
      koponya: 25,
      bomba: -50,
      érmék: -25,
      tekercs: 10,
    },
    revealCount: 5, // Hány mező legyen felfedve egy kattintásra
  }

  const [score, setScore] = useState(0)
  const [cells, setCells] = useState<Cell[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [remainingMoves, setRemainingMoves] = useState(10)
  const [lastRevealedCells, setLastRevealedCells] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [lastPointsChange, setLastPointsChange] = useState(0)
  const [revealedRow, setRevealedRow] = useState<Cell[]>([])

  // Játék inicializálása
  useEffect(() => {
    initializeGame()
  }, [])

  // Játék inicializáló függvény
  const initializeGame = () => {
    const totalCells = gameConfig.rows * gameConfig.cols

    // Létrehozunk egy tömböt az összes elem típussal a megadott eloszlás szerint
    let items: ItemType[] = []
    Object.entries(gameConfig.itemDistribution).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        items.push(type as ItemType)
      }
    })

    // Ha kevesebb elem van, mint cella, üres cellákat adunk hozzá
    while (items.length < totalCells) {
      items.push("tekercs")
    }

    // Ha több elem van, mint cella, levágjuk a tömböt
    if (items.length > totalCells) {
      items = items.slice(0, totalCells)
    }

    // Megkeverjük az elemek tömbjét
    items = shuffleArray(items)

    // Létrehozzuk a cellákat
    const newCells = Array.from({ length: totalCells }, (_, index) => ({
      id: index,
      revealed: false,
      type: items[index],
      points: gameConfig.pointsMap[items[index]],
      isShuffling: false,
      revealOrder: null,
    }))

    setCells(newCells)
    setScore(0)
    setGameOver(false)
    setRemainingMoves(10)
    setLastRevealedCells([])
    setLastPointsChange(0)
    setRevealedRow([])
  }

  // Tömb keverő függvény
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Játék gomb kezelése - elemek átrendezése és 5 új elem megjelenítése
  const handlePlayClick = () => {
    if (gameOver || isAnimating) return

    setIsAnimating(true)
    setRevealedRow([]) // Töröljük az előző felfedett sort

    // Először jelöljük az összes cellát keverésre
    setCells((prevCells) =>
      prevCells.map((cell) => ({
        ...cell,
        isShuffling: true,
        revealed: false,
        revealOrder: null,
      })),
    )

    // Új elemek létrehozása
    const totalCells = gameConfig.rows * gameConfig.cols
    let items: ItemType[] = []
    Object.entries(gameConfig.itemDistribution).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        items.push(type as ItemType)
      }
    })

    // Ha kevesebb elem van, mint cella, üres cellákat adunk hozzá
    while (items.length < totalCells) {
      items.push("tekercs")
    }

    // Ha több elem van, mint cella, levágjuk a tömböt
    if (items.length > totalCells) {
      items = items.slice(0, totalCells)
    }

    // Megkeverjük az elemek tömbjét
    items = shuffleArray(items)

    // Véletlenszerűen kiválasztunk 5 cellát, amelyek felfedettek lesznek
    const cellsToReveal = shuffleArray([...Array(totalCells).keys()]).slice(0, gameConfig.revealCount)
    setLastRevealedCells(cellsToReveal)

    // Keverési animáció után frissítjük a cellákat
    setTimeout(() => {
      // Frissítjük a cellákat az új elemekkel
      const updatedCells = Array.from({ length: totalCells }, (_, index) => ({
        id: index,
        revealed: false,
        type: items[index],
        points: gameConfig.pointsMap[items[index]],
        isShuffling: false,
        revealOrder: cellsToReveal.includes(index) ? cellsToReveal.indexOf(index) : null,
      }))

      setCells(updatedCells)

      // Sorban felfedünk minden kiválasztott cellát
      const revealedCellsData: Cell[] = cellsToReveal.map((cellId) => ({
        ...updatedCells[cellId],
        revealed: true,
      }))

      // Sorban felfedünk minden kiválasztott cellát
      revealedCellsData.forEach((cell, index) => {
        setTimeout(
          () => {
            // Hozzáadjuk a felfedett cellát a sorhoz
            setRevealedRow((prev) => [...prev, cell])

            // Az utolsó cella felfedése után frissítjük a pontszámot
            if (index === revealedCellsData.length - 1) {
              // Kiszámoljuk a pontváltozást
              const pointsChange = cellsToReveal.reduce((total, cellId) => {
                return total + updatedCells[cellId].points
              }, 0)

              // Frissítjük a pontszámot
              setScore((prevScore) => prevScore + pointsChange)
              setLastPointsChange(pointsChange)

              // Csökkentjük a hátralévő lépések számát
              setRemainingMoves((prevMoves) => {
                const newMoves = prevMoves - 1
                if (newMoves <= 0) {
                  setGameOver(true)
                }
                return newMoves
              })

              // Frissítjük a cellákat, hogy a kiválasztottak felfedettek legyenek
              setCells((prevCells) =>
                prevCells.map((cell) => {
                  if (cellsToReveal.includes(cell.id)) {
                    return { ...cell, revealed: true }
                  }
                  return cell
                }),
              )

              // Animáció befejezése
              setTimeout(() => {
                setIsAnimating(false)
              }, 500)
            }
          },
          400 * (index + 1),
        ) // Minden cella 400ms késleltetéssel jelenik meg
      })
    }, 800) // Keverési animáció időtartama
  }

  // Ikon lekérése az elem típusához
  const getItemIcon = (type: ItemType, size = 24) => {
    const iconProps = { size, className: "mx-auto" }

    switch (type) {
      case "műtárgy":
        return <Gem {...iconProps} className="text-purple-500 mx-auto" />
      case "kincs":
        return <Coins {...iconProps} className="text-amber-500 mx-auto" strokeWidth={3} />
      case "koponya":
        return <Skull {...iconProps} className="text-gray-700 mx-auto" />
      case "bomba":
        return <Bomb {...iconProps} className="text-red-500 mx-auto" />
      case "érmék":
        return <Coins {...iconProps} className="text-amber-300 mx-auto" />
      case "tekercs":
        return <Scroll {...iconProps} className="text-amber-700 mx-auto" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-red-600 text-white p-2 text-center text-sm">
        <p>Ez egy ingyenes közösségi platform, kizárólag 18 éven felülieknek.</p>
      </div>

      <Header />

      <main className="flex-grow py-8 bg-amber-50">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Régészeti Expedíció</h1>

          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-amber-100 p-6 rounded-lg text-center border border-amber-200">
              <h2 className="text-xl font-semibold mb-4">Segíts a régésznek megtalálni a kincseket!</h2>
              <p className="text-lg mb-2">
                A régész ősi romokat kutat értékes műtárgyak után. Segíts neki megtalálni a legjobb ásatási helyeket!
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <Card className="border-amber-300">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold mb-2">Pontszámod</h2>
                      <p className="text-3xl font-bold text-amber-600">{score}</p>

                      {lastPointsChange !== 0 && (
                        <p
                          className={`text-lg font-semibold mt-2 ${lastPointsChange > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {lastPointsChange > 0 ? `+${lastPointsChange}` : lastPointsChange}
                        </p>
                      )}
                    </div>

                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold mb-2">Hátralévő Próbálkozások</h2>
                      <p className="text-3xl font-bold text-amber-500">{remainingMoves}</p>
                    </div>

                    <div className="text-center mb-6">
                      <Button
                        onClick={handlePlayClick}
                        disabled={gameOver || isAnimating}
                        className="bg-amber-600 hover:bg-amber-700 w-full py-6 text-lg"
                      >
                        {isAnimating ? "Átrendezés folyamatban..." : "Átrendezés!"}
                      </Button>
                    </div>

                    {gameOver && (
                      <div className="text-center mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h3 className="text-lg font-semibold mb-2">Játék Vége!</h3>
                        <p className="mb-4">
                          Végső pontszámod: <span className="font-bold">{score}</span>
                        </p>
                        <Button onClick={initializeGame} className="bg-amber-600 hover:bg-amber-700">
                          Új Játék
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Felfedett elemek sora */}
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4 text-center">Felfedett Leletek</h2>
                  <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: gameConfig.revealCount }).map((_, index) => {
                        const cell = revealedRow[index]
                        return (
                          <div
                            key={index}
                            className={`w-16 h-16 rounded-md flex items-center justify-center transition-all duration-300 ${cell
                                ? "bg-amber-50 border-2 border-amber-300"
                                : "bg-amber-200/50 border-2 border-amber-200/50"
                              }`}
                          >
                            {cell && (
                              <div className="relative w-full h-full p-2 flex flex-col items-center justify-center animate-fadeIn">
                                {getItemIcon(cell.type, 24)}
                                <span
                                  className={`mt-1 text-xs font-bold px-1 rounded ${cell.points > 0
                                      ? "bg-green-100 text-green-700"
                                      : cell.points < 0
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                  {cell.points > 0 ? `+${cell.points}` : cell.points}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3">
                <Card className="border-amber-300">
                  <CardContent className="p-6">
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${gameConfig.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${gameConfig.rows}, 1fr)`,
                      }}
                    >
                      {cells.map((cell) => (
                        <div
                          key={cell.id}
                          className={`aspect-square border-2 rounded-md flex items-center justify-center transition-all duration-300 ${cell.isShuffling
                              ? "animate-pulse border-amber-400 bg-amber-200"
                              : cell.revealed
                                ? lastRevealedCells.includes(cell.id)
                                  ? "border-yellow-400 bg-yellow-50"
                                  : "border-amber-200 bg-amber-50"
                                : "border-amber-300 bg-amber-100"
                            }`}
                          style={{
                            animationDelay: cell.isShuffling ? `${Math.random() * 0.5}s` : "0s",
                          }}
                          aria-label={cell.revealed ? `Felfedett mező: ${cell.type}` : "Felfedetlen mező"}
                        >
                          {cell.revealed ? (
                            <div className="relative w-full h-full p-2 flex flex-col items-center justify-center">
                              {getItemIcon(cell.type, 36)}
                              <span
                                className={`mt-1 text-xs font-bold px-1 rounded ${cell.points > 0
                                    ? "bg-green-100 text-green-700"
                                    : cell.points < 0
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                              >
                                {cell.points > 0 ? `+${cell.points}` : cell.points}
                              </span>
                            </div>
                          ) : (
                            <div
                              className={`w-full h-full bg-amber-500 rounded-sm flex items-center justify-center ${cell.isShuffling ? "animate-spin" : ""
                                }`}
                            >
                              <Shovel className="text-white h-8 w-8" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      <DisclaimerModal />
    </div>
  )
}
