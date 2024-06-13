
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { IconButton } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

function LockComponent() {

    const [locked, setLocked] = useState<WakeLockSentinel | undefined>();
    const lockRef = useRef<WakeLockSentinel>()

    const requestScreenLock = () => {
        if (locked) {
            clearScreenLock();
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        } else {
            applyScreenLock();
            document.body.requestFullscreen();
        }
    };

    const clearScreenLock = () => {
        if (lockRef.current) {
            locked?.release();
            setLocked(undefined);
        }
    }

    const applyScreenLock = () => {
        const wakeLock = navigator.wakeLock;
        wakeLock.request('screen').then((locked: WakeLockSentinel) => {
            setLocked(locked);
        });
    }

    useEffect(() => {

        console.debug('✨ building lock component');
        window.onresize = () => {

            const maxHeight = window.screen.height;
            const maxWidth = window.screen.width;
            const curHeight = window.innerHeight;
            const curWidth = window.innerWidth;

            if (maxWidth === curWidth && maxHeight === curHeight) {
                applyScreenLock();
            } else {
                clearScreenLock();
            }

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        console.debug('⚙ updating lock component');
        lockRef.current = locked;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locked]);

    return (
        <IconButton
            onClick={requestScreenLock}
            sx={{ margin: '6px' }}

        >
            {locked ? <LockIcon /> : <LockOpenIcon />}
        </IconButton>
        // <Button
        //     size='small'
        //     variant={'outlined'}
        //     endIcon={locked ? <LockIcon /> : <LockOpenIcon />} onClick={requestScreenLock}
        //     sx={{ margin: '6px' }}
        // >
        // </Button>
    );

}

export default LockComponent;