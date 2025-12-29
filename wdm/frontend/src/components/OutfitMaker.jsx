import { useState, useEffect } from 'react';
import { outfitAPI } from '../services/api';

const OutfitMaker = ({ clothingItems }) => {
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

  useEffect(() => {
    // Filter items by category
    const topsItems = clothingItems.filter(item => 
      ['tops', 'sweaters', 'jackets'].includes(item?.category)
    );
    const bottomsItems = clothingItems.filter(item => 
      ['bottoms'].includes(item?.category)
    );
    const shoesItems = clothingItems.filter(item => 
      ['shoes'].includes(item?.category)
    );

    setTops(topsItems);
    setBottoms(bottomsItems);
    setShoes(shoesItems);
    
    fetchSavedOutfits();
  }, [clothingItems]);

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

  return (
    <div style={{padding: '2rem 0'}}>
      <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '2rem'}}>Outfit Maker</h2>
      
      {/* Current Outfit Display */}
      <div style={{backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', marginBottom: '2rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'}}>
        <h3 style={{fontSize: '1.125rem', fontWeight: '500', marginBottom: '1.5rem', textAlign: 'center'}}>Current Outfit</h3>
        
        {/* Vertical Stacked Outfit */}
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '2rem'}}>
          <div style={{width: '300px', minHeight: '500px', backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            
            {/* Top Section */}
            <div style={{flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'}}>
              <div style={{position: 'relative', width: '100%', height: '150px'}}>
                {currentTop?.image_path ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${currentTop.image_path}`}
                    alt="Top"
                    style={{maxWidth: '100%', maxHeight: '140px', objectFit: 'contain', display: 'block', margin: '0 auto'}}
                  />
                ) : (
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', color: '#9ca3af'}}>
                    <span>No tops available</span>
                  </div>
                )}
                
                {/* Navigation Arrows for Tops */}
                {tops.length > 1 && (
                  <>
                    <button
                      onClick={() => setTopIndex((prev) => (prev - 1 + tops.length) % tops.length)}
                      style={{
                        position: 'absolute',
                        left: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '30px',
                        height: '30px',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setTopIndex((prev) => (prev + 1) % tops.length)}
                      style={{
                        position: 'absolute',
                        right: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '30px',
                        height: '30px',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div style={{flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'}}>
              <div style={{position: 'relative', width: '100%', height: '150px'}}>
                {currentBottom?.image_path ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${currentBottom.image_path}`}
                    alt="Bottom"
                    style={{maxWidth: '100%', maxHeight: '140px', objectFit: 'contain', display: 'block', margin: '0 auto'}}
                  />
                ) : (
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', color: '#9ca3af'}}>
                    <span>No bottoms available</span>
                  </div>
                )}
                
                {/* Navigation Arrows for Bottoms */}
                {bottoms.length > 1 && (
                  <>
                    <button
                      onClick={() => setBottomIndex((prev) => (prev - 1 + bottoms.length) % bottoms.length)}
                      style={{
                        position: 'absolute',
                        left: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '30px',
                        height: '30px',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setBottomIndex((prev) => (prev + 1) % bottoms.length)}
                      style={{
                        position: 'absolute',
                        right: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '30px',
                        height: '30px',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Shoes Section */}
            <div style={{flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{position: 'relative', width: '100%', height: '150px'}}>
                {currentShoes?.image_path ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${currentShoes.image_path}`}
                    alt="Shoes"
                    style={{maxWidth: '100%', maxHeight: '140px', objectFit: 'contain', display: 'block', margin: '0 auto'}}
                  />
                ) : (
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', color: '#9ca3af'}}>
                    <span>No shoes available</span>
                  </div>
                )}
                
                {/* Navigation Arrows for Shoes */}
                {shoes.length > 1 && (
                  <>
                    <button
                      onClick={() => setShoesIndex((prev) => (prev - 1 + shoes.length) % shoes.length)}
                      style={{
                        position: 'absolute',
                        left: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '30px',
                        height: '30px',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setShoesIndex((prev) => (prev + 1) % shoes.length)}
                      style={{
                        position: 'absolute',
                        right: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '30px',
                        height: '30px',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Item Count Indicators */}
        <div style={{display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', fontSize: '0.875rem', color: '#6b7280'}}>
          <span>Top {topIndex + 1} of {tops.length}</span>
          <span>Bottom {bottomIndex + 1} of {bottoms.length}</span>
          <span>Shoes {shoesIndex + 1} of {shoes.length}</span>
        </div>

        {/* Horizontal Scroll for All Items */}
        <div style={{marginBottom: '2rem'}}>
          <h4 style={{fontSize: '1rem', fontWeight: '500', marginBottom: '1rem', textAlign: 'center'}}>Browse All Items</h4>
          
          {/* Tops Scroll */}
          <div style={{marginBottom: '1.5rem'}}>
            <h5 style={{fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#6b7280'}}>Tops/Jackets/Sweaters</h5>
            <div style={{display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem'}}>
              {tops.map((item, index) => (
                <div 
                  key={item.id}
                  onClick={() => setTopIndex(index)}
                  style={{
                    flexShrink: 0,
                    width: '80px',
                    height: '80px',
                    border: index === topIndex ? '2px solid #2563eb' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {item.image_path && (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${item.image_path}`}
                      alt={item.brand}
                      style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottoms Scroll */}
          <div style={{marginBottom: '1.5rem'}}>
            <h5 style={{fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#6b7280'}}>Bottoms</h5>
            <div style={{display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem'}}>
              {bottoms.map((item, index) => (
                <div 
                  key={item.id}
                  onClick={() => setBottomIndex(index)}
                  style={{
                    flexShrink: 0,
                    width: '80px',
                    height: '80px',
                    border: index === bottomIndex ? '2px solid #2563eb' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {item.image_path && (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${item.image_path}`}
                      alt={item.brand}
                      style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shoes Scroll */}
          <div style={{marginBottom: '1.5rem'}}>
            <h5 style={{fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#6b7280'}}>Shoes</h5>
            <div style={{display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem'}}>
              {shoes.map((item, index) => (
                <div 
                  key={item.id}
                  onClick={() => setShoesIndex(index)}
                  style={{
                    flexShrink: 0,
                    width: '80px',
                    height: '80px',
                    border: index === shoesIndex ? '2px solid #2563eb' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {item.image_path && (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${item.image_path}`}
                      alt={item.brand}
                      style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Outfit Section */}
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <input
            type="text"
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
            placeholder="Enter outfit name..."
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
          <button
            onClick={handleSaveOutfit}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Outfit'}
          </button>
        </div>

        {message && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: message.includes('success') ? '#f0fdf4' : '#fef2f2',
            color: message.includes('success') ? '#14532d' : '#7f1d1d'
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Saved Outfits */}
      <div>
        <h3 style={{fontSize: '1.125rem', fontWeight: '500', marginBottom: '1.5rem'}}>Saved Outfits</h3>
        
        {savedOutfits.length === 0 ? (
          <div style={{textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem'}}>
            <p style={{color: '#6b7280'}}>No saved outfits yet. Create your first outfit above!</p>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem'}}>
            {savedOutfits.map((outfit) => (
              <div key={outfit.id} style={{backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'}}>
                <h4 style={{fontSize: '1rem', fontWeight: '500', marginBottom: '1rem'}}>{outfit.name}</h4>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem'}}>
                  {outfit.top_image && (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${outfit.top_image}`}
                      alt="Top"
                      style={{width: '100%', height: '80px', objectFit: 'contain', borderRadius: '0.25rem'}}
                    />
                  )}
                  {outfit.bottom_image && (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${outfit.bottom_image}`}
                      alt="Bottom"
                      style={{width: '100%', height: '80px', objectFit: 'contain', borderRadius: '0.25rem'}}
                    />
                  )}
                  {outfit.shoes_image && (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${outfit.shoes_image}`}
                      alt="Shoes"
                      style={{width: '100%', height: '80px', objectFit: 'contain', borderRadius: '0.25rem'}}
                    />
                  )}
                </div>

                <button
                  onClick={() => handleDeleteOutfit(outfit.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitMaker;