
interface PlayerListProps {
    players: string[];
    isHost: boolean;
    currentUserName: string;
    onKick: (playerName: string) => void;
    lobbyCode: string;
}

export default function PlayerList({ players, isHost, currentUserName, onKick, lobbyCode }: PlayerListProps) {
    return (
        <div class=" bg-slate-500 rounded-lg p-4 w-[98%] text-white font-mono">
            <div class="w-full flex justify-between items-center">
                <h3 class="text-xl font-semibold mb-3">Players</h3>
                <h3 class="text-xl font-semibold mb-3">Lobby Code: {lobbyCode}</h3>
            </div>


            <div class="flex flex-col gap-2">

                {players.map((player) => (

                    <div key={player} class="flex justify-between items-center py-2">
                        <div >{player} {player === currentUserName}</div>

                        {isHost && player !== currentUserName && (
                            <button
                                onClick={() => onKick(player)}
                                class="px-3 py-1 bg-red-400/70 hover:bg-red-500/70 transition-colors rounded">
                                Kick
                            </button>

                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
