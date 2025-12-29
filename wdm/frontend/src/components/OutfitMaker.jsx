import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clothingAPI, outfitAPI } from '../services/api';

const OutfitMaker = () => {
  const [items, setItems] = useState([]);
  const [tops, setTops] = useState([]);
  const [bottoms, setBottoms] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [shoesIndex, setShoesIndex] = useState(0);
  const [outfitName, setOutfitName] = useState('');
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [itemsLoading, setItemsLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
    fetchSavedOutfits();
  }, []);

  const fetchItems = async () => {
    try {
      const items = await clothingAPI.getAll();
      setItems(items);
      
      // Filter items by category
      const topsItems = items.filter(item => 
        ['tops', 'sweaters', 'jackets'].includes(item?.category)
      );
      const bottomsItems = items.filter(item => 
        ['bottoms'].includes(item?.category)
      );
      const shoesItems = items.filter(item => 
        ['shoes'].includes(item?.category)
      );

      setTops(topsItems);
      setBottoms(bottomsItems);
      setShoes(shoesItems);
      setItemsLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setMessage('Error loading clothing items');
      setItemsLoading(false);
    }
  };

  const fetchSavedOutfits = async () => {
    try {
      const outfits = await outfitAPI.getAll();
      setSavedOutfits(outfits);
    } catch (error) {
      console.error('Error fetching outfits:', error);
    }
  };

  const handleSaveOutfit = async () => {
    if (!outfitName.trim()) {
      setMessage('Please enter an outfit name');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      await outfitAPI.create({
        name: outfitName,
        topId: tops[topIndex]?.id || null,
        bottomId: bottoms[bottomIndex]?.id || null,
        shoesId: shoes[shoesIndex]?.id || null,
      });
      
      setOutfitName('');
      setMessage('Outfit saved successfully!');
      fetchSavedOutfits();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving outfit:', error);
      setMessage('Error saving outfit');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOutfit = async (outfitId) => {
    if (!window.confirm('Are you sure you want to delete this outfit?')) {
      return;
    }

    try {
      await outfitAPI.delete(outfitId);
      setMessage('Outfit deleted successfully!');
      fetchSavedOutfits();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting outfit:', error);
      setMessage('Error deleting outfit');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const currentTop = tops[topIndex];
  const currentBottom = bottoms[bottomIndex];
  const currentShoes = shoes[shoesIndex];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (itemsLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-5 h-5 mx-auto mb-4"></div>
          <p className="text-body">Loading your wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header style={{backgroundColor: 'white', borderBottom: '1px solid #f3f4f6'}}>
        <div className="container" style={{padding: '1.5rem 0'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div>
              <h1 style={{fontSize: '1.5rem', fontWeight: '600', color: '#111827'}}>Outfit Maker</h1>
              <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>Create outfit combinations from your wardrobe</p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{textAlign: 'right'}}>
                <p style={{fontSize: '0.875rem', color: '#6b7280'}}>Items in wardrobe</p>
                <p style={{fontSize: '1.5rem', fontWeight: '600', color: '#111827'}}>{items.length}</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 200ms ease-in-out'
                }}
              >
                ← Back to Wardrobe
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 200ms ease-in-out'
                }}
              >
                Logout
              </button>
        </div>
      </main>
    </div>
  );
};

export default OutfitMaker;