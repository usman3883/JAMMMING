import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import SearchComponent from "./SearchComponent"
var token;
function AccessToken() {
  var client_id = '7f594215f8fe4976abc2082035ee6f6c';
  var client_secret = '04a47979ceef471787cbb8d90f6cfb1d';

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    }).toString(),
  };

  fetch(authOptions.url, {
    method: 'POST',
    headers: authOptions.headers,
    body: authOptions.body,
  })
    .then(response => response.json())
    .then(data => {
      token = data.access_token;
      console.log('Spotify token:', token);
      // You can now use `token` in other API calls
    })
    .catch(error => {
      console.error('Error fetching token:', error);
    });

}

AccessToken();


function App() {
  const [searchTerm, setSearchterm] = useState("");
  var [listOfSongs, setListOfSongs] = useState([]);
  function onClickHandle() {
    //Function the api to return list of songs
    const searchSongs = async (query, token) => {
      try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        const data = await response.json();
        console.log('Search Results:', data.tracks.items)
        setListOfSongs(data.tracks.items || []);
      } catch (error) {
        alert(error)
        console.log("Error searching songs:", error);
        return [];
      }
    }
    searchSongs(searchTerm, token);
  };

  return (
    <div className="App">
      <header>
        <div className='headerStyle'>
          <h1>Jammming</h1>
        </div>
      </header>
      <div className='searchDiv'>
        <input id='search' name='search' value={searchTerm} onChange={(e) => setSearchterm(e.target.value)}></input>
        <button onClick={onClickHandle}>Search</button>
      </div>
      <div className="gridContainer">
        <div className='searchResults'>
          {listOfSongs.map((n) => {
            return (
              <SearchComponent
                key={n.id}
                name={n.name}
                id={n.id}
                artists={n.artists.map(artist => artist.name).join(", ")}
              />
            )
          })}
        </div>
        <div className='savedPlaylists'>

        </div>

      </div>
    </div>
  );
}

export default App;
