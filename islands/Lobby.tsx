import { useState } from "preact/hooks";
import Canvas from "./Canvas.tsx";
import PlayerList from "./PlayerList.tsx";


export default function Lobby() {

    const [userName, setUserName] = useState("");
    const [code, setCode] = useState("");
    const [screen, setScreen] = useState("joinLobby");

    const [players, setPlayers] = useState([]);
    const[isHost, setIsHost] = useState(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [gameStarted, setGameStarted] = useState(false);




    const handleJoin = () =>{
        

        try {
            

            //get players and set
            // Note: This assumes ws.ts is located at routes/api/ws.ts
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
                    setGameStarted(true);
                }

            };
            setSocket(ws);
            
            setScreen("Lobby");
        }

        catch{
            console.log("error");
        }

        
    }

    
    const handleCreate = () =>{
        

        try {
            



            //get players and set

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
                    setGameStarted(true);
                }

                if (message.type === "kicked") {
                    setSocket(null);
                    setPlayers([]);
                    setIsHost(false);
                    setScreen("joinLobby");
                }
            };
            setSocket(ws);

            setIsHost(true);
            setScreen("Lobby");
        }

        catch{
            console.log("error")
        }

        
    }

    const handleLeave = () => {
        if (socket) {
            socket.close();
        }
        
        setSocket(null);
        setPlayers([]);
        setIsHost(false);
        setScreen("joinLobby");
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

    const handleStart = () => {
        console.log("start game");
        if (socket && isHost) {
            socket.send(JSON.stringify({ type: "start", code }));
        }
    };



  return (
    <div class="w-full h-screen bg-red-300 flex justify-center">

        <div class="w-3/4 h-full bg-red-500 rounded-xl">
            

        {screen == "joinLobby" && (
        
            
            <div class="h-full w-full flex flex-col items-center gap-12 mt-14">

                <h1 class="text-4xl mt-8 font-semibold"> ___</h1>

            <div class="w-10/12 bg-slate-200 flex flex-col gap-6 text-center">
                <h2  class="text-3xl ">Username</h2>

                <input type="text" 
                    value={userName}  
                    onInput={(e) => setUserName(e.currentTarget.value)}    
                    class="h-[3rem] rounded-2xl p-5 text-center"      
                />


            </div>  
            <div class="w-10/12 bg-slate-200 flex flex-col gap-6 text-center">
                <h2  class="text-3xl ">Lobby Code</h2>

                <input type="text" 
                    value={code}  
                    onInput={(e) => setCode(e.currentTarget.value)}    
                    class="h-[3rem] rounded-2xl p-5 text-center"      
                />

                <button
                class="w-full h-[3rem] bg-emerald-300 rounded-2xl font-semibold
                "
                onClick={handleJoin}> Join Lobby</button>
                <button
                class="w-full h-[3rem] bg-emerald-300 rounded-2xl font-semibold
                "
                onClick={handleCreate}> Create Lobby</button>


            </div>
        


            </div>
        )}



        {screen == "Lobby" && (
        
            
            <div class="h-full w-full flex flex-col items-center gap-12 mt-14">

                <h1 class="text-4xl mt-8 font-semibold"> {code}</h1>

            
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
                onClick={isHost ? handleStart : handleLeave}> {isHost ? "Start" : "Leave" }</button>


            </div>
        )}

        {gameStarted && (
            <div class="h-full w-full flex flex-col items-center gap-4 mt-14">
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
