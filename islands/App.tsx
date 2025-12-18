import { useState } from "preact/hooks";
import Lobby from "./Lobby.tsx";
import Canvas from "./Canvas.tsx";
import PlayerList from "./PlayerList.tsx";

type Screen = "joinLobby" | "lobby" | "game";

export default function App() {
    const [userName, setUserName] = useState("");
    const [code, setCode] = useState("");
    const [screen, setScreen] = useState<Screen>("joinLobby");

    const [players, setPlayers] = useState<string[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const handleJoin = () => {
        try {
            const ws = new WebSocket(window.location.origin.replace("http", "ws") + "/api/ws");

            ws.onopen = () => {
                ws.send(JSON.stringify({ type: "join", code, username: userName }));
            };

            ws.onerror = (e) => console.log("WebSocket error:", e);

            ws.onmessage = (e) => {
                const message = JSON.parse(e.data);

                if (message.type === "joined") {
                    setPlayers(message.players);
                }
                if (message.type === "start") {
                    setScreen("game");
                }
                if (message.type === "kicked") {
                    ws.close();
                    setSocket(null);
                    setPlayers([]);
                    setIsHost(false);
                    setScreen("joinLobby");
                }
            };

            setSocket(ws);
            setScreen("lobby");
        } 
        catch {
            console.log("error");
        }
    };

    const handleCreate = () => {
        try {
            const ws = new WebSocket(window.location.origin.replace("http", "ws") + "/api/ws");

            ws.onopen = () => {
                ws.send(JSON.stringify({ type: "create", username: userName }));
            };

            ws.onerror = (e) => console.log("WebSocket Error:", e);

            ws.onmessage = (e) => {
                const message = JSON.parse(e.data);

                if (message.type === "created") {
                    setCode(message.code);
                    setPlayers(message.players);
                }

                if (message.type === "joined") {
                    setPlayers(message.players);
                }
                if (message.type === "start") {
                    setScreen("game");
                }

                if (message.type === "kicked") {
                    ws.close();
                    setSocket(null);
                    setPlayers([]);
                    setIsHost(false);
                    setScreen("joinLobby");
                }
            };

            setSocket(ws);
            setIsHost(true);

            setScreen("lobby");
        } 
        
        catch {
            console.log("error");
        }
    };




    const handleRemovePlayer = (playerName: string) => {
        if (socket && isHost) {
            socket.send(JSON.stringify({
                type: "remove",
                code: code,
                playerName: playerName
            }));
        }
    };

    const handleLeave = () => {
        if (socket) {
            socket.close();
        }

        
        setSocket(null);
        setPlayers([]);
        setIsHost(false);
        setScreen("joinLobby");
    };




    const handleStart = () => {
        console.log("start game");
        if (socket && isHost) {
            socket.send(JSON.stringify({ type: "start", code }));
        }
    };

    



    return (
        <div class="w-full h-screen bg-red-300 flex justify-center">
            <div class="w-3/4 h-full bg-red-500 rounded-xl">

                {screen === "joinLobby" && (
                    <Lobby
                        userName={userName}
                        setUserName={setUserName}
                        code={code}
                        setCode={setCode}
                        onJoin={handleJoin}
                        onCreate={handleCreate}
                    />
                )}

                {screen === "lobby" && (
                    <div class="h-full w-full flex flex-col items-center gap-12 ">
                        <h1 class="text-4xl mt-8 font-semibold">{code}</h1>

                        <div class="w-10/12 bg-slate-200 flex flex-col gap-6 text-center">
                            {players.map((player) => (
                                <div class="flex justify-between items-center px-4">
                                    <div>{player}</div>
                                    {isHost && player !== userName && (
                                        <button
                                            class="bg-red-400 px-3 py-1 font-semibold"
                                            onClick={() => handleRemovePlayer(player)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            class="w-full h-[3rem] bg-emerald-300 rounded-2xl font-semibold"
                            onClick={isHost ? handleStart : handleLeave}
                        >
                            {isHost ? "Start" : "Leave"}
                        </button>
                    </div>
                )}

                {screen === "game" && (
                    <div class="h-full w-full flex flex-col items-center gap-4">
                        <Canvas socket={socket} code={code} />
                        <button
                            class="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-white"
                            onClick={handleLeave}
                        >
                            Leave Game
                        </button>
                        <PlayerList
                            players={players}
                            isHost={isHost}
                            currentUserName={userName}
                            onKick={handleRemovePlayer}
                        />
                    </div>
                )}

            </div>
        </div>
    );
}
