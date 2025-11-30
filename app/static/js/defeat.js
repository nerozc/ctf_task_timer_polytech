const numWatchers = 30; 
const body = document.body;

localStorage.removeItem('cult_doom_start_time');

for (let i = 0; i < numWatchers; i++) {
    const eye = document.createElement('div');
    eye.classList.add('watcher');
    
    const x = Math.random() * 95; 
    const y = Math.random() * 95;
    
    eye.style.left = `${x}%`;
    eye.style.top = `${y}%`;
    
    const delay = Math.random() * 55;
    eye.style.animationDelay = `${delay}s`;
    
    const duration = 2 + Math.random() * 4;
    eye.style.animationDuration = `${duration}s`;

    body.appendChild(eye);
}