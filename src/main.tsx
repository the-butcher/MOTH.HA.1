import ReactDOM from 'react-dom/client';
import AppScene from './AppScene.tsx';
import AppDither from './AppDither.tsx';


const querySeparatorIndex = document.location.href.indexOf('?');
let mode = 'scene';
if (querySeparatorIndex > 0) {
    const usp = new URLSearchParams(document.location.href.substring(querySeparatorIndex));
    if (usp.has('m', 'dither')) {
        mode = 'dither';
    }
}

if (mode === 'dither') {
    ReactDOM.createRoot(document.getElementById('root')!).render(<AppDither />);
} else {
    ReactDOM.createRoot(document.getElementById('root')!).render(<AppScene />);
}
