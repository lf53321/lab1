import React, {useState} from 'react';
import { Form, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import roundRobin from 'roundrobin';
import app from './firebase';

type CustomFormProps = {
    email: string;
    setShowForm:  React.Dispatch<React.SetStateAction<boolean>>;
};

function generateMatches(competitors:string[]){
    const rounds = roundRobin(competitors.length, competitors);
    const matches: string[][] = [];

    rounds.forEach((round: any[], roundIndex: number) => {
        round.forEach(matchup => {
            const match = [];
            match.push(roundIndex + 1);
            match.push(matchup[0]);
            match.push(matchup[1]);
            match.push(-1);
            match.push(-1);

            matches.push(match);
        });
    });

    return matches
}

function CustomForm(props: CustomFormProps) {
    const [name, setName] = useState('');
    const [points, setPoints] = useState('');
    const [competitors, setCompetitors] = useState('');
    const [nameError, setNameError] = useState('');
    const [pointsError, setPointsError] = useState('');
    const [competitorsError, setCompetitorsError] = useState('');
    const renderTooltip = (message:string) => (
        <Tooltip>{message}</Tooltip>
    );

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        let err : boolean = false

        if (!name) {
            setNameError("Potreban je naziv natjecanja")
            err = true
        } else {
            setNameError("")
        }

        let arrPoints = points.split("/")
        if (!points) {
            setPointsError("Potreban je sustav bodovanja")
            err = true
        } else if (points.split("/").length !== 3) {
            setPointsError("Pogrešno upisan zapis")
            err = true
        } else if (arrPoints.filter(item => isNaN(parseFloat(item))).length !== 0) {
            setPointsError("Bodovi moraju biti brojčane vrijednosti")
            err = true
        } else {
            setPointsError("")
        }

        let arrCompetitors: string[];
        if (competitors.includes(";")) {
            arrCompetitors = competitors.split(";")
        } else {
            arrCompetitors = competitors.split("\n")
        }
        arrCompetitors = arrCompetitors.filter(item => item)
        if (!competitors) {
            setCompetitorsError("Potrebno je navesti sudionike")
            err = true
        } else if (arrCompetitors.length < 4 || arrCompetitors.length > 8) {
            setCompetitorsError("Potrebno je navesti od 4 do 8 sudionika")
            err = true
        } else if (new Set(arrCompetitors).size !== arrCompetitors.length){
            setCompetitorsError("Nisu dozvoljene ponavljajuće vrijednosti")
            err = true
        } else {
            setCompetitorsError("")
        }

        if(!err) {
            try {
                const db = getFirestore(app);
                const refTournaments = await addDoc(collection(db, "tournaments"), {
                    email: props.email,
                    name: name,
                    points: arrPoints,
                    competitors: arrCompetitors
                });
                const matches = generateMatches(arrCompetitors)
                for (const match of matches) {
                    await addDoc(collection(db, "matches"), {
                        tournament_id: refTournaments.id,
                        round: match[0],
                        home: match[1],
                        away: match[2],
                        home_score: match[3],
                        away_score: match[4]
                    });
                }
                console.log("Data saved successfully!");
                setName("");
                setPoints("");
                setCompetitors("");
                props.setShowForm(false);
            } catch (error) {
                console.error("Error saving data: ", error);
            }
        }
    }

    return (
        <div className="form-container">
            <form className="row g-3" style={{borderStyle:"double", borderColor:"blue", margin:"20px", padding:"5px"}} onSubmit={handleSubmit}>
                <div className="col-md-6">
                    <label htmlFor="name" className="form-label">Naziv natjecanja</label>
                    <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip('Upišite naziv natjecanja')}
                    >
                        <Form.Control
                            type="text"
                            placeholder="Premier League"
                            value={name}
                            id="name"
                            onChange={(e) => setName(e.target.value)}
                            isInvalid={!!nameError}
                        />
                    </OverlayTrigger>
                    <Form.Control.Feedback type="invalid">
                        {nameError}
                    </Form.Control.Feedback>
                </div>
                <div className="col-md-6">
                    <label htmlFor="points" className="form-label">Sustav bodovanja</label>
                    <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip('Upišite sustav bodovanja u obliku pobjeda/remi/poraz')}
                    >
                        <Form.Control
                            type="text"
                            placeholder="3/1/0"
                            value={points}
                            id="points"
                            onChange={(e) => setPoints(e.target.value)}
                            isInvalid={!!pointsError}
                        />
                    </OverlayTrigger>
                    <Form.Control.Feedback type="invalid">
                        {pointsError}
                    </Form.Control.Feedback>
                </div>
                <div className="col-12">
                    <label htmlFor="competitors" className="form-label">Popis natjecatelja</label>
                    <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip('Upišite 4-8 natjecatelja odvojenih sa točka zarez ili novim redom')}
                    >
                        <Form.Control
                            as="textarea" rows={8}
                            placeholder="Manchester United;Liverpool;..."
                            value={competitors}
                            id="competitors"
                            onChange={(e) => setCompetitors(e.target.value)}
                            isInvalid={!!competitorsError}
                        />
                    </OverlayTrigger>
                    <Form.Control.Feedback type="invalid">
                        {competitorsError}
                    </Form.Control.Feedback>
                </div>

                <div className="col-12">
                    <button type="submit" className="btn btn-primary">Stvori natjecanje</button>
                </div>
            </form>
        </div>
    );
}

export default CustomForm;
