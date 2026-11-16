
import './App.css'

function App() {
  return (
    <div className="app">

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">
          Save<span>Bite</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#food">Available Food</a>
          <a href="#impact">Our Impact</a>
        </div>

        <button className="login-btn">Login / Sign Up</button>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="tagline">SAVE FOOD • SHARE HOPE</p>

          <h1>
            Good Food Deserves
            <span> Another Chance.</span>
          </h1>

          <p className="hero-description">
            Connecting surplus food with people who need it.
            Together, we can reduce food waste and make a difference.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Explore Food</button>
            <button className="secondary-btn">Donate Food</button>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900"
            alt="Fresh and healthy food"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <p className="section-tag">WHY SAVEBITE?</p>
        <h2>Small Actions, Big Impact</h2>

        <p>
          SaveBite is a platform that helps restaurants, shops and
          individuals share their surplus food with people who need it.
          Instead of wasting good food, let's give it a second chance.
        </p>
      </section>

      {/* Food Section */}
      <section className="food-section" id="food">
        <p className="section-tag">DISCOVER FOOD</p>
        <h2>Food That Needs a New Home</h2>

        <div className="food-cards">
          <div className="food-card">
            <img
              src="https://images.unsplash.com/photo-1547592180-85f173990554?w=600"
              alt="Fresh vegetable meal"
            />
            <div className="food-info">
              <h3>Fresh Veg Meals</h3>
              <p>Healthy meals available for collection.</p>
              <button>View Details</button>
            </div>
          </div>

          <div className="food-card">
            <img
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"
              alt="Fresh bread"
            />
            <div className="food-info">
              <h3>Fresh Bakery Items</h3>
              <p>Delicious bakery items ready to be shared.</p>
              <button>View Details</button>
            </div>
          </div>

          <div className="food-card">
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600"
              alt="Fresh food bowl"
            />
            <div className="food-info">
              <h3>Healthy Food Bowls</h3>
              <p>Nutritious food looking for a new home.</p>
              <button>View Details</button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact" id="impact">
        <p className="section-tag">OUR MISSION</p>
        <h2>Every Bite Makes a Difference</h2>

        <div className="impact-stats">
          <div>
            <h3>0+</h3>
            <p>Meals Saved</p>
          </div>

          <div>
            <h3>0+</h3>
            <p>Food Donors</p>
          </div>

          <div>
            <h3>0+</h3>
            <p>Happy Recipients</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <h2>Save<span>Bite</span></h2>
        <p>Saving food today, creating a better tomorrow.</p>
        <p>© 2026 SaveBite. All rights reserved.</p>
      </footer>

    </div>
  )
}

export default App
