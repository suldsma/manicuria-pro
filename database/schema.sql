-- ===============================================
-- BASE DE DATOS: manicuria_pro
-- Motor: MySQL 8.0+
-- ===============================================

CREATE DATABASE IF NOT EXISTS manicuria_pro
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE manicuria_pro;

-- ===============================================
-- TABLA: admins
-- ===============================================
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- TABLA: servicios
-- ===============================================
CREATE TABLE servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion INT NOT NULL COMMENT 'Duración en minutos',
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    imagen VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activo (activo),
    INDEX idx_precio (precio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- TABLA: turnos
-- ===============================================
CREATE TABLE turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(100),
    servicio_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado ENUM('pendiente', 'pagado', 'confirmado', 'cancelado', 'completado') DEFAULT 'pendiente',
    pago_id VARCHAR(100),
    pago_estado VARCHAR(50),
    pago_monto DECIMAL(10, 2),
    pago_metodo VARCHAR(50),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE RESTRICT,
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado),
    INDEX idx_servicio (servicio_id),
    INDEX idx_fecha_hora (fecha, hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- INSERTAR DATOS INICIALES
-- ===============================================

-- Admin por defecto
-- Password: admin123 (hasheado con bcrypt)
INSERT INTO admins (nombre, email, password, rol) VALUES
('Administrador', 'admin@manicuria.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Servicios de manicuría
INSERT INTO servicios (nombre, descripcion, duracion, precio, activo, imagen) VALUES
('Esmaltado Semipermanente', 'Duración de hasta 3 semanas con acabado profesional y brillante', 60, 7500.00, TRUE, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'),
('Manicuría Completa', 'Limado, cutículas, hidratación y esmaltado tradicional', 45, 5000.00, TRUE, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400'),
('Uñas Esculpidas', 'Extensión y diseño personalizado con gel de alta calidad', 90, 12000.00, TRUE, 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400'),
('Kapping', 'Refuerzo y alargamiento natural de uñas sin dañar', 75, 9500.00, TRUE, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400'),
('Retiro de Semipermanente', 'Retiro seguro sin dañar la uña natural con productos profesionales', 30, 3000.00, TRUE, 'https://images.unsplash.com/photo-1583001809398-ea64a785d0f3?w=400'),
('Nail Art Premium', 'Diseños personalizados y decoración avanzada con cristales y efectos', 90, 15000.00, TRUE, 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400'),
('Pedicuría Spa', 'Tratamiento completo de pies con exfoliación, masaje e hidratación', 60, 6500.00, TRUE, 'https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=400'),
('Soft Gel', 'Fortalecimiento y brillo natural sin extensión', 50, 8000.00, TRUE, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400');