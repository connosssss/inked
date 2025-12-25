import { useEffect, useRef, useState } from "preact/hooks";




interface CanvasProps {
    socket: WebSocket | null;
    code: string;
}

export default function Canvas({ socket, code }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); 

    const [isDrawing, setIsDrawing] = useState(false);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);




    const [color, setColor] = useState("#000000");
    const [size, setSize] = useState(5);
    const [erase, setErase] = useState(false);




    


    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !canvasRef.current) return;

            const parent = containerRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            if (!context) return;

            const curImage = context.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;

            context.putImageData(curImage, 0, 0);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };


    }, []);

    
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


        context.beginPath();
        context.moveTo(prevX, prevY);
        context.lineTo(x, y);
        context.strokeStyle = erase ? "#FFFFFF" : drawColor;
        context.lineWidth = size;
        context.lineCap = "round";
        context.lineJoin = "round";
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

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        
        if (!tempCtx) return;

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        tempCtx.fillStyle = "#FFFFFF";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);

        const link = document.createElement("a");
        link.download = `canvas-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL("image/png");
        link.click();
    };


    return (
        <div class="flex flex-col items-center gap-4 w-full h-screen p-4 font-mono text-white">
            
    
            <div class="flex flex-wrap gap-2 bg-slate-500 p-2 rounded shadow items-center">
                <input 
                    type="color" 
                    value={color} 
                    onInput={(e) => setColor(e.currentTarget.value)} 
                    class="h-12 w-12 cursor-pointer border-none rounded bg-slate-500"
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
                    class="px-4 h-5/6 bg-rose-600/50 hover:bg-rose-800/50 text-white rounded transition-colors duration-200"
                >
                    Clear
                </button>

                <button 
                    onClick={downloadCanvas}
                    class="px-4 h-5/6 bg-emerald-600/50 hover:bg-emerald-800/50 text-white rounded transition-colors duration-200"
                >
                    Save
                </button>
                

                <button 
                    onClick={() => { setErase(!erase);}}
                    class="px-4 py-2"
                >
                    {erase ? "Drawing Mode" : "Erasing Mode"}
                </button>

                <input type="range" id="size" min="1" max="200" value={size} onInput={(e) => setSize(Number(e.currentTarget.value))} 
                class="accent-[#273346]"/>
                <input type="text" id="size" value={size} onInput={(e) => setSize(Number(e.currentTarget.value))}
                class="bg-slate-500 text-center w-[4rem] text-xl"  />
            </div>
            
            <div 
                ref={containerRef} 
                class="w-full flex-grow bg-white border-2 border-slate-800 rounded overflow-hidden shadow-lg"
            >

            <canvas
                ref={canvasRef}  
                class="block cursor-crosshair touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => {setIsDrawing(false)}}
                onMouseLeave={() => {setIsDrawing(false)}}
            />

            </div>

        </div>
    );
}
