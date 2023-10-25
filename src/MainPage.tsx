import React, {useEffect, useState} from 'react';
import {useAuth0} from '@auth0/auth0-react';
import CustomForm from "./CustomForm";
import {collection, getDocs, getFirestore, query, where} from 'firebase/firestore';
import app from './firebase';

export interface ITournament {
    id: string;
    email: string;
    name: string;
    points: string[],
    competitors: string[]
}

async function fetchUserTournaments(email:string | undefined) {
    const db = getFirestore(app);
    const tourRef = collection(db, 'tournaments');

    const q = query(tourRef, where("email", "==", email));

    const querySnapshot = await getDocs(q);
    const tournaments : ITournament[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
            return {
                id: doc.id,
                email: data.email,
                name: data.name,
                points: data.points,
                competitors: data.competitors
            };
        }
    );
    return tournaments;
}

function MainPage() {
    const { user} = useAuth0();
    const [showForm, setShowForm] = useState(false);
    const [tournaments, setTournaments] = useState<ITournament[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (user) {
            const fetchedTournaments = await fetchUserTournaments(user?.email);
            setTournaments(fetchedTournaments);
            }
        }

        fetchData();
    }, [user, user?.email, showForm]);

    return user ? (
        <>
        <div style={{display: "flex"}}>
            <h3 style={{padding: '0 20px'}}>Moja natjecanja</h3>
            <button className="btn btn-primary" onClick={() => setShowForm(prevState => !prevState)}> {showForm ? "Odustani" : "Dodaj natjecanje"}</button>
        </div>
        <div>
            {showForm && <CustomForm email={user.email!} setShowForm={setShowForm}/>}
        </div>
        <div style={{margin: '20px'}}>
            <ul className="list-group" style={{margin: '20px'}}>
                {tournaments.map(tournament => (
                    <a key={tournament.id} href={`tournament/${tournament.id}`} className="list-group-item list-group-item-action" style={{borderStyle:"solid", borderColor:"blue"}}>{tournament.name}</a>
                ))}
            </ul>
        </div>
        </>
    ) : <></>;
}

export default MainPage;