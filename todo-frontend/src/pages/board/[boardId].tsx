import { useParams } from 'react-router-dom';
import { useState } from 'react';
import MainBoard from '../../components/mainBoard';

export default function BoardView() {
    const { boardId } = useParams<{ boardId: string }>();
    const [showModal, setShowModal] = useState(false);

 if (!boardId) {
        return <div>Loading...</div>;
    }
    
    return (
        <MainBoard
            key={boardId}  
            boardId={boardId}
            showModal={showModal}
            onCloseModal={() => setShowModal(false)}
            onOpenModal={() => setShowModal(true)}
        />
    );
}