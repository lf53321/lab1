import React from 'react';
import Navbar from "./Navbar";
import Tournament from "./Tournament";
import './Navbar.css';
import './App.css'
import MainPage from "./MainPage";
import {BrowserRouter, Route, Routes} from "react-router-dom";

function App() {
  return (
        <>
            <Navbar/>
        <div className='app'>
            <BrowserRouter>
                <Routes>
                    <Route path={"/"} element={<MainPage/>}/>
                    <Route path={"/tournament/:id"} element={<Tournament edit={true}/>}/>
                    <Route path={"/preview/tournament/:id"} element={<Tournament edit={false}/>}/>
                </Routes>
            </BrowserRouter>
        </div>
        </>
  )
}

export default App;