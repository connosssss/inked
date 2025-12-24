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


    
    const [showPlayerList, setShowPlayerList] = useState(false);

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
        <div class="w-full min-h-screen bg-[#273346] flex flex-col justify-center items-center ">
            

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
                    <div class="h-full w-full flex flex-col items-center gap-12 text-white font-mono">
                        <h1 class="text-4xl mt-8 font-semibold">{code}</h1>

                        <div class="w-10/12 flex flex-col gap-6 text-center">
                            {players.map((player) => (
                                <div class="flex flex-row justify-center items-center text-center px-4 gap-18">


                                    <div class="text-xl font-semibold flex flex-row gap-4">
                                        
                                        <div>{player}</div>

                                    <div class=" ml-18">
                                    {isHost && player !== userName && (
                                        <button
                                            class="bg-red-500/75 hover:bg-red-600/75 transition-colors duration-200 px-3 py-1 font-semibold rounded-md "
                                            onClick={() => handleRemovePlayer(player)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                    </div>

                                    
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            class="w-3/4 h-[3rem] bg-slate-500 hover:bg-slate-600 transition-colors duration-200 rounded-md font-semibold
                            "
                            onClick={isHost ? handleStart : handleLeave}
                        >
                            {isHost ? "Start" : "Leave"}
                        </button>
                    </div>
                )}

                {(screen === "game"  ) && (<div
                class="flex flex-col gap-10 w-full justify-center items-center mb-20">
                    <Canvas socket={socket} code={code} />
                    <div class="h-full w-full flex flex-row items-center justify-center gap-4">
                        
                        <button
                            class="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-white"
                            onClick={handleLeave}
                        >
                            Leave Game
                        </button>

                        <button
                            class="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-white"
                            onClick={() => {setShowPlayerList(!showPlayerList)}}
                        >
                            {showPlayerList ? "Hide Player List" : "Show Player List"}
                        </button>

                        
                        
                    </div>


                    {showPlayerList && (
                        <PlayerList
                            players={players}
                            isHost={isHost}
                            currentUserName={userName}
                            onKick={handleRemovePlayer}
                        />)}
                    </div>
                )}

            
        </div>
    );
}
