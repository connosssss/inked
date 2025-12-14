import { useEffect, useRef, useState } from "preact/hooks";

interface CanvasProps {
    socket: WebSocket | null;
    code: string;
}

export default function Canvas({ socket, code }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const [color, setColor] = useState("#000000");

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.type === "draw") {
                draw(message.x, message.y, message.prevX, message.prevY, message.color, false);
            }
            if (message.type === "clear") {
                const canvas = canvasRef.current;
                const context = canvas?.getContext("2d");
                if (canvas && context) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket]);

    const draw = (x: number, y: number, prevX: number, prevY: number, drawColor: string, emit: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");


        if (!context) return;


        // Need to remove hard coding for this
        context.beginPath();
        context.moveTo(prevX, prevY);
        context.lineTo(x, y);
        context.strokeStyle = drawColor;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        if (emit && socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "draw",
                code,
                x,
                y,
                prevX,
                prevY,
                color: drawColor
            }));
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        setIsDrawing(true);
        setLastX(e.offsetX);
        setLastY(e.offsetY);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDrawing) return;

        draw(e.offsetX, e.offsetY, lastX, lastY, color, true);
        setLastX(e.offsetX);
        setLastY(e.offsetY);
    };



    return (
        <div class="flex flex-col items-center gap-4">
            <div class="flex bg-red-200">

                <input 
                    type="color" 
                    value={color} 
                    onInput={(e) => setColor(e.currentTarget.value)} 
                    
                    class="h-10 w-10 cursor-pointer"
                />

                <button 
                    onClick={() => {
                        // clear on user end
                        const canvas = canvasRef.current;
                        const context = canvas?.getContext("2d");
                        if (canvas && context) {
                            context.clearRect(0, 0, canvas.width, canvas.height);
                        }

                        // clear for others

                        if (socket && socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify({ type: "clear", code }));
                        }
                    }}
                    class="px-4 py-2"
                >
                    Clear
                </button>
            </div>

            <canvas
                ref={canvasRef}  width={800} height={600}
                class="bg-white border-2 border-slate-800 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => {setIsDrawing(false)}}
                onMouseLeave={() => {setIsDrawing(false)}}
            />

        </div>
    );
}
