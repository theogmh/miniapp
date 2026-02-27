export async function enterFullscreen(element = document.documentElement) {
    if ((element as any).requestFullscreen) {
        await (element as any).requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) { 
        await (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) { 
        await (element as any).msRequestFullscreen(); 
    }
}

export async function exitFullscreen() {
    if ((document as any).exitFullscreen) {
        (document as any).exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) { 
        (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) { 
        (document as any).msExitFullscreen();
    }
}