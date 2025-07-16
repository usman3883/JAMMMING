import './App.css';
import { useState, useEffect } from 'react';
import SearchComponent from "./SearchComponent"
import SavedComponent from './SavedComponent';
import { generateCodeVerifier, generateCodeChallenge } from './pkceUtils';





const clientId = '7f594215f8fe4976abc2082035ee6f6c';
const redirectUri = "https://1677b6fdfb0c.ngrok-free.app"
// Or your deployed URL
const scopes = [
  'playlist-modify-public',
  'playlist-modify-private'
];

async function getAccessToken() {
  // Only generate a new code verifier if none exists (i.e. first login attempt)
  let codeVerifier = window.localStorage.getItem("code_verifier");
  if (!codeVerifier) {
    codeVerifier = generateCodeVerifier();
    window.localStorage.setItem("code_verifier", codeVerifier);
  }

  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes.join(' '))}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

  window.location.href = authUrl;
}


function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const codeVerifier = localStorage.getItem('code_verifier');
      console.log("code:", code);
      console.log("code_verifier:", codeVerifier);
      console.log("redirect_uri:", redirectUri);

      fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      })
        .then(async res => {
          if (!res.ok) {
            const errorData = await res.json();
            console.error('Spotify token error:', errorData);
            throw new Error(errorData.error_description || 'Token exchange failed');
          }
          return res.json();
        })
        .then(data => {
          setToken(data.access_token);
          // Clear code verifier, you no longer need it
          window.localStorage.removeItem('code_verifier');
          // Clear code param from URL to prevent reuse
          window.history.replaceState({}, document.title, "/");
        })
    }
  }, []);



  const [searchTerm, setSearchterm] = useState("");
  const [listOfSongs, setListOfSongs] = useState([]);
  const [savedSongs, setSavedSongs] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");


  function onClickHandle() {
    if (!token) {
      alert("Please login to Spotify first.");
      return;
    }
    // ... existing code ...


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
  function handleAddPlaylist(info) {
    alert(`${info.name} | ${info.id} | ${info.artists} | ${info.uri}`);

    setSavedSongs(prev => {
      // Avoid adding duplicates
      const alreadyAdded = prev.some(song => song.id === info.id);
      if (alreadyAdded) return prev;

      return [...prev, info];
    });
  }
  function handleRemove(id) {
    setSavedSongs((prev) => {
      return prev.filter((n) => n.id !== id)
    })
  }
  function handleOnChange(e) {
    setNewPlaylistName(e.target.value);
  }
  async function savePlaylist() {
    if (!newPlaylistName) {
      alert("Please enter a playlist name.");
      return;
    }
    if (savedSongs.length === 0) {
      alert("Please add some songs to your playlist.");
      return;
    }

    try {
      // 1. Get current user's ID
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userResponse.json();

      // 2. Create a new playlist
      const createResponse = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newPlaylistName,
          description: "Playlist created via Jammming app",
          public: false
        })
      });
      const playlistData = await createResponse.json();

      // 3. Add tracks to the playlist
      const uris = savedSongs.map(song => song.uri);
      await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris })
      });

      alert(`Playlist "${newPlaylistName}" created!`);
      // Optional: Clear playlist name and saved songs after saving
      setNewPlaylistName("");
      setSavedSongs([]);

    } catch (error) {
      console.error("Error saving playlist:", error);
      alert("Failed to save playlist. Please try again.");
    }
  }

  return (
    <div className="App">
      <header>
        <div className='headerStyle'>
          <h1>Jammming</h1>
          {!token && (
            <button onClick={getAccessToken}>Login with Spotify</button>
          )}

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
                handleAddPlaylist={handleAddPlaylist}
                key={n.id}
                name={n.name}
                id={n.id}
                uri={n.uri}
                artists={n.artists.map(artist => artist.name).join(", ")}
              />
            )
          })}
        </div>
        <div className='savedPlaylists'>
          <h1>Playlist Name</h1>
          <input value={newPlaylistName} onChange={handleOnChange} placeholder='Enter the name for your playlist'></input>
          {savedSongs.map((n) => {
            return (
              <SavedComponent handleRemove={handleRemove} key={n.id} name={n.name} id={n.id} artists={n.artists} />
            )
          })}
          <button onClick={savePlaylist}>Save Playlist</button>

        </div>

      </div>
    </div>
  );
}

export default App;
