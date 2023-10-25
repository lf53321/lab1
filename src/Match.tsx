import React, { useState } from 'react';
import {updateDoc, doc, getFirestore} from "firebase/firestore";
import app from "./firebase";
import { useAuth0 } from '@auth0/auth0-react';
import {ITournament} from "./MainPage";

interface IMatchProps {
    tournament_id: string,
    tournament: ITournament,
    id: string,
    round: number,
    home: string;
    away: string;
    home_score: number;
    away_score: number;
}

function Match(props: IMatchProps){
    const { user} = useAuth0();
    const [homeScore, setHomeScore] = useState<number | string>(props.home_score);
    const [homeScoreCurrent, setHomeScoreCurrent] = useState<number | string>(props.home_score);
    const [awayScore, setAwayScore] = useState<number | string>(props.away_score);
    const [awayScoreCurrent, setAwayScoreCurrent] = useState<number | string>(props.away_score);
    const [error, setError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault()
        let err = false

        if (!homeScoreCurrent || isNaN(Number(homeScoreCurrent)) || homeScoreCurrent < 0 || !awayScoreCurrent || awayScoreCurrent < 0 || isNaN(Number(awayScoreCurrent))) {
            setHomeScoreCurrent(homeScore)
            setAwayScoreCurrent(awayScore)
            setError(true)
            err = true
        } else {
            setError(false)
        }

        if(!err) {
            const matchRef = doc(getFirestore(app), 'matches', props.id);

            try {
                await updateDoc(matchRef, {home_score : homeScoreCurrent, away_score :awayScoreCurrent});
                setHomeScore(homeScoreCurrent)
                setAwayScore(awayScoreCurrent)
                console.log("Document successfully updated!");
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        }
    }

    return (
        <>
        <form onSubmit={handleSubmit}>
        <div className="d-flex align-items-center justify-content-between" style={{ width: '360px', margin: '10px', padding:'5px', borderColor:'darkblue', borderStyle:'solid', borderRadius:'5px'}}>

            <span className="mr-3" style={{ width: '120px' }}>{props.home}</span>
            {isEditing ? (
                <input type="text" className="form-control mr-2" value={homeScoreCurrent === -1 ? "" : homeScoreCurrent} maxLength={3} style={{ width: '55px' }} onChange={e =>
                        setHomeScoreCurrent(e.target.value)
                }
                />
            ) : (
                <span className="mr-3"> {homeScoreCurrent === -1 ? "-" : homeScoreCurrent} </span>
            )}
            <span className="mr-3">:</span>
            {isEditing ? (
                <input type="text" className="form-control mr-2" value={awayScoreCurrent === -1 ? "" : awayScoreCurrent} maxLength={3} style={{ width: '55px' }} onChange={e =>
                    setAwayScoreCurrent(e.target.value)
                } />
            ) : (
                <span className="mr-3">{awayScoreCurrent === -1 ? "-" : awayScoreCurrent}</span>
            )}
            <span className="mr-3" style={{ width: '120px', textAlign:"right" }}>{props.away}</span>
            {user?.email === props.tournament.email ? <button type={isEditing ? "button" : "submit"} className={`btn btn-${isEditing ? 'primary' : 'secondary'}`} style={{ marginLeft:"5px" }} onClick={() => {
                setIsEditing(!isEditing)}}>
                {isEditing ? 'Spremi' : 'Izmjeni'}
            </button> : <></>}
        </div>
        </form>
            {!isEditing && error ? <span>Ilegalni rezultat upisan!</span> : <></>}
            {isEditing ? (
                <div>
                    <button className={`btn btn-primary'}`} onClick={() => {
                        setError(false)
                        setIsEditing(!isEditing)
                    }}>
                        Odustani
                    </button>
                    <button className={`btn btn-primary'}`} onClick={async () => {
                        setError(false)
                        setIsEditing(!isEditing)
                        const matchRef = doc(getFirestore(app), 'matches', props.id);
                        await updateDoc(matchRef, {home_score: -1, away_score: -1});
                        setHomeScoreCurrent(-1)
                        setAwayScoreCurrent(-1)
                        setHomeScore(-1)
                        setAwayScore(-1)
                    }}>
                        Obriši rezultat
                    </button>
                </div>) : <></>}
        </>
    );
}

export default Match;