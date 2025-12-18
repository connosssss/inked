
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
        <div class="h-3/4 w-[40%] flex flex-col gap-12 bg-slate-800 p-10 text-white 
        rounded-xl shadow-lg justify-center font-mono">

            {/* 
            <h1 class="text-4xl mt-8 font-semibold w-full text-start">___</h1>
             */}
            

            <div class="w-full flex flex-col gap-6 text-start">
                <h2 class="text-4xl font-bold">Username</h2>

                <input
                    type="text"
                    value={userName}
                    onInput={(e) => setUserName(e.currentTarget.value)}
                    class="h-[3rem] p-5 text-center rounded-md"
                />
            </div> 


            <div class="w-full flex flex-col gap-6 text-start">
                <h2 class="text-4xl font-bold">Lobby Code</h2>
                <input
                    type="text"
                    value={code}
                    onInput={(e) => setCode(e.currentTarget.value)}
                    class="h-[3rem] p-5 text-center rounded-md"/>

 
 
 
                <div class="w-full flex flex-row gap-5">
                    <button
                        class="w-full h-[3rem] bg-slate-500 hover:bg-slate-600 shadow-md transition-colors duration-200 rounded-md font-semibold"
                        onClick={onJoin}
                    >
                        Join Lobby
                    </button>
                
                    <button
                        class="w-full h-[3rem] bg-slate-500 hover:bg-slate-600 shadow-md transition-colors duration-200 rounded-md font-semibold"
                        onClick={onCreate}
                    >
                        Create Lobby
                    </button>   
                    
                    
                    </div>         
           </div>
        </div>
    );
}
