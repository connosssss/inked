import { Handlers } from "$fresh/server.ts";


const kv = await Deno.openKv();



// Stores all of the individual players connections to the server, mapping the ids to specific socket connections

const connections = new Map<string, WebSocket>();

export const handler: Handlers = {

    GET(request) {
        //Web socket needs to be in the request and defined by frontend
        const {socket, response } = Deno.upgradeWebSocket(request);
        let userId: string | null = null;

        socket.onopen = () => {
            console.log("connected to socket")
        }

        socket.onmessage = async(e) => {

            const message = JSON.parse(e.data)



            if (message.type == "create"){
                const newCode = Math.random().toString(32).substring(0,8)
                const hostId = crypto.randomUUID();
                


                await kv.set(["lobbies", newCode], {
                    players: [
                        { id: hostId, name: message.username }
                    ],

                    host: message.username
                })
                

                connections.set(hostId, socket);
                userId = hostId

                socket.send(JSON.stringify({
                    type: "created",
                    code: newCode,
                    players: [message.username]
                }))


            }



            if (message.type == "join"){

                const entry = await kv.get(["lobbies", message.code])
                const lobby = entry.value;


                if(!lobby) {
                    return
                }

                const playerId = crypto.randomUUID();
                lobby.players.push({id: playerId, name: message.username})

                await kv.set(["lobbies", message.code], lobby)


                connections.set(playerId, socket);
                userId = playerId;


                const players = lobby.players.map(p => p.name);
                    for (const player of lobby.players) {
                        const userSocket = connections.get(player.id);
                        if (userSocket && userSocket.readyState === WebSocket.OPEN) {
                            userSocket.send(JSON.stringify(
                            {
                            type: "joined",
                            code: message.code,
                            players: players
                            }
                        ));
                     }
                    }
        


            }

             
            
        }


        socket.onclose = async () => {
                    if(userId){
                        connections.delete(userId);


                        const entries = kv.list({prefix: ["lobbies"]})

                        for await (const entry of entries){
                            const lobby = entry.value;
                            const length = lobby.players.length;
                            lobby.players = lobby.players.filter(player => player.id !== userId)


                            if(lobby.players.length === 0){
                                await kv.delete(entry.key)
                            }
                            
                            else if(lobby.players.length < length){
                                await kv.set(entry.key, lobby);
                            }


                            const playerNames = lobby.players.map(p => p.name);
                            for (const player of lobby.players) {
                                const playerSocket = connections.get(player.id);
                                if (playerSocket && playerSocket.readyState === WebSocket.OPEN) {

                                 playerSocket.send(JSON.stringify({
                                    type: "joined",
                                    code: entry.key[1],
                                    players: playerNames
                                    }));
                                }

                            }
                        }
                        


                    }
                }
       


        
        return response;
    }
}