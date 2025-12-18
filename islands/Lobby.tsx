
interface LobbyProps {
    userName: string;
    setUserName: (value: string) => void;
    code: string;
    setCode: (value: string) => void;
    onJoin: () => void;
    onCreate: () => void;
}


export default function Lobby({ userName, setUserName, code, setCode, onJoin, onCreate }: LobbyProps) {
    return (
        <div class="h-full w-full flex flex-col items-center gap-12">
            <h1 class="text-4xl mt-8 font-semibold">___</h1>

            <div class="w-10/12 bg-slate-200 flex flex-col gap-6 text-center">
                <h2 class="text-3xl">Username</h2>

                <input
                    type="text"
                    value={userName}
                    onInput={(e) => setUserName(e.currentTarget.value)}
                    class="h-[3rem] rounded-2xl p-5 text-center"
                />
            </div>


            <div class="w-10/12 bg-slate-200 flex flex-col gap-6 text-center">
                <h2 class="text-3xl">Lobby Code</h2>
                <input
                    type="text"
                    value={code}
                    onInput={(e) => setCode(e.currentTarget.value)}
                    class="h-[3rem] rounded-2xl p-5 text-center"/>

 
 
 
                <button
                    class="w-full h-[3rem] bg-emerald-300 rounded-2xl font-semibold"
                    onClick={onJoin}
                >
                    Join Lobby
                </button>
                
                <button
                    class="w-full h-[3rem] bg-emerald-300 rounded-2xl font-semibold"
                    onClick={onCreate}
                >
                    Create Lobby
            </button>            
           </div>
        </div>
    );
}
