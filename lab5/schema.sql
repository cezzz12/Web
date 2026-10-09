CREATE TABLE IF NOT EXISTS destinations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(120) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    tourist_targets TEXT NOT NULL,
    estimated_cost_per_day DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_destinations_country (country_name),
    INDEX idx_destinations_location (location_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO destinations (location_name, country_name, description, tourist_targets, estimated_cost_per_day) VALUES
('Paris', 'France', 'Classic city break with museums, monuments, cafes, and walkable neighborhoods.', 'Eiffel Tower, Louvre Museum, Montmartre, Notre-Dame area', 165.00),
('Barcelona', 'Spain', 'Mediterranean destination with beaches, distinctive architecture, and lively food markets.', 'Sagrada Familia, Park Guell, La Rambla, Barceloneta Beach', 135.00),
('Brasov', 'Romania', 'Mountain city close to castles, hiking trails, medieval squares, and scenic viewpoints.', 'Council Square, Tampa Mountain, Bran Castle, Rasnov Fortress', 75.00),
('Kyoto', 'Japan', 'Historic destination known for temples, gardens, tea culture, and traditional streets.', 'Fushimi Inari Shrine, Kiyomizu-dera, Arashiyama Bamboo Grove, Gion', 145.00),
('Rome', 'Italy', 'Ancient city with major archaeological sites, churches, piazzas, and excellent food.', 'Colosseum, Roman Forum, Vatican Museums, Trevi Fountain', 150.00),
('Cluj-Napoca', 'Romania', 'Student city with cultural events, parks, cafes, and quick access to Transylvanian trips.', 'Central Park, Botanical Garden, Union Square, Turda Salt Mine', 65.00);