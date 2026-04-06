CREATE DATABASE superwow;
GO
USE superwow;
GO

CREATE TABLE clientes (
    id_cliente INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100),
    direccion VARCHAR(150)
);
GO

CREATE TABLE productos (
    id_producto INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100),
    precio DECIMAL(10,2),
    imagen VARCHAR(255)
);
GO

CREATE TABLE facturas (
    id_factura INT IDENTITY(1,1) PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha DATE,
    total DECIMAL(10,2),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);
GO

CREATE TABLE detalle_factura (
    id_detalle INT IDENTITY(1,1) PRIMARY KEY,
    id_factura INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT,
    subtotal DECIMAL(10,2),
    FOREIGN KEY (id_factura) REFERENCES facturas(id_factura),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);
GO

-- CLIENTES
INSERT INTO clientes (nombre, direccion)
VALUES 
('Juan Perez', 'Calle 1'),
('Maria Lopez', 'Calle 2');

-- PRODUCTOS
INSERT INTO productos (nombre, precio, imagen)
VALUES
('Arroz', 3000, 'img/arroz.png'),
('Leche', 2500, 'img/leche.png'),
('Pan', 1500, 'img/pan.png');


USE superwow;

SELECT * FROM clientes;
SELECT * FROM productos;
SELECT * FROM facturas;
SELECT * FROM detalle_factura;