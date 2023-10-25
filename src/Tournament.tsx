import React, {useEffect, useState} from 'react';
import {getDoc, getDocs, getFirestore, query, where, doc, collection, onSnapshot, Unsubscribe} from 'firebase/firestore';
import app from './firebase';
import { useParams } from 'react-router-dom';
import {ITournament} from "./MainPage";
import Match from "./Match";
import './Table.css'


interface IMatch {
    tournament_id: string,
    id: string,
    round: number,
    home: string,
    away: string,
    home_score: number,
    away_score: number
}

function listener(id: string | undefined, setScores: { (value: React.SetStateAction<Map<string, number[]> | undefined>): void; (arg0: Map<string, number[]> | undefined): void; }) {
    const collectionRef = collection(getFirestore(app), 'matches');
    let unsubscribe : Unsubscribe | undefined;

    if(id) {
         unsubscribe = onSnapshot(collectionRef, async snapshot => {
             const updatedData = await fetchMatchesByID(id);

             const scores = await calculateOrder(id, updatedData)
             setScores(scores);
         });
    }

    return unsubscribe;
}

async function calculateOrder(id: string, data: IMatch[]) {
    const tournament: ITournament | null = await fetchTournamentByID(id);

    let scores : undefined | Map<string,number[]>

    if (tournament) {
        const points = tournament.points
        const competitors: string[] = tournament.competitors;
        scores = new Map<string, number[]>()

        competitors.forEach(c => {
            let numbers = [0,0,0,0,0]
            data.forEach(m => {
                if(m.home === c && m.home_score !== -1) {
                   numbers[0]++
                   if(m.home_score > m.away_score) {
                       numbers[1]++
                       numbers[4] += Number(points[0])
                   } else if (m.home_score < m.away_score) {
                       numbers[3]++
                       numbers[4] += Number(points[2])
                   } else {
                       numbers[2]++
                       numbers[4] += Number(points[1])
                   }
                } else if (m.away === c && m.home_score !== -1) {
                   numbers[0]++
                    if(m.home_score < m.away_score) {
                        numbers[1]++
                        numbers[4] += Number(points[0])
                    } else if (m.home_score > m.away_score) {
                        numbers[3]++
                        numbers[4] += Number(points[2])
                    } else {
                        numbers[2]++
                        numbers[4] += Number(points[1])
                    }
                }
           })
           scores!.set(c, numbers)
       })
    }
    return new Map([...scores!.entries()].sort((a, b) => b[1][4] - a[1][4]));
}

export async function fetchTournamentByID(id: string | undefined) {
    const db = getFirestore(app);
    const tourRef = doc(db, 'tournaments', id!);
    const tournament = await getDoc(tourRef);

    if (tournament.exists()) {
        return tournament.data() as ITournament;
    } else {
        console.log('No such item!');
        return null;
    }
}

async function fetchMatchesByID(id: string | undefined) {
    const db = getFirestore(app);
    const matchRef = collection(db, 'matches');

    const q = query(matchRef, where("tournament_id", "==", id));

    const querySnapshot = await getDocs(q);
    const matches : IMatch[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                tournament_id: data.tournament_id,
                id: doc.id,
                round: data.round,
                home: data.home,
                away: data.away,
                home_score: data.home_score,
                away_score: data.away_score
            };
        }
    );
    return matches;
}

function Tournament() {
    const {id} = useParams();
    const [tournament, setTournament] = useState<ITournament>();
    const [matches, setMatches] = useState<IMatch[]>([]);
    const [scores, setScores] = useState<Map<string,number[]>>();

    useEffect(() => {
        async function fetchData() {
            const fetchedTournament = await fetchTournamentByID(id);
            if(fetchedTournament) {
                setTournament(fetchedTournament);
                const fetchedMatches = await fetchMatchesByID(id);
                setMatches(fetchedMatches)
                setScores(await calculateOrder(id!, matches))
            }
        }

        fetchData();
    }, [id]);

    useEffect(() => {

        const stopListening = listener(id, setScores);


        return () => {
            if (stopListening) {
                stopListening();
            }
        };
    }, []);

    return (
        tournament && scores ? (
        <>
            <div style={{display:"flex", flexFlow:"column", alignItems:"center"}}>
                <h1>{tournament.name}</h1>
                <table className="leaderboard">
                    <thead>
                        <tr>
                            <th className="column-name">Naziv</th>
                            <th className="column-small">P</th>
                            <th className="column-small">W</th>
                            <th className="column-small">D</th>
                            <th className="column-small">L</th>
                            <th className="column-small">Bodovi</th>
                        </tr>
                    </thead>
                    <tbody>
                {[...scores.entries()].map(([key, value]) => (
                    <tr>
                        <td>{key}</td>
                        <td>{value[0]}</td>
                        <td>{value[1]}</td>
                        <td>{value[2]}</td>
                        <td>{value[3]}</td>
                        <td>{value[4]}</td>
                    </tr>
                ))}
                    </tbody>
                </table>
                {tournament.competitors.map((x,index) => {
                    if (index === tournament.competitors.length) return;
                    return (<div style={{display:"flex", flexFlow:"column", alignItems:"center"}}>
                        <h1>{index + 1}. kolo</h1>
                        {matches.filter(match => match.round === index + 1).map(match => (
                            <Match tournament={tournament} id={match.id} tournament_id={match.tournament_id} round={match.round} home={match.home} away={match.away} away_score={match.away_score} home_score={match.home_score}/>
                        ))}
                    </div>);
                })}
            </div>
        </>) : <></>
    )
}

export default Tournament;
