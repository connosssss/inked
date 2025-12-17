
interface PlayerListProps {
    players: string[];
    isHost: boolean;
    currentUserName: string;
    onKick: (playerName: string) => void;
}

export default function PlayerList({ players, isHost, currentUserName, onKick }: PlayerListProps) {
    return (
        <div class="w-full bg-white rounded-lg p-4 ">
            <h3 class="text-xl font-semibold mb-3">Players</h3>


            <div class="flex flex-col gap-2">

                {players.map((player) => (

                    <div key={player} class="flex justify-between items-center bg-gray-50 p-2">
                        <div >{player} {player === currentUserName}</div>

                        {isHost && player !== currentUserName && (
                            <button
                                onClick={() => onKick(player)}
                                class="px-3 py-1 bg-red-100 hover:bg-red-200 transition-colors">
                                Kick
                            </button>

                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
