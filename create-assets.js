const fs = require('fs');
const path = require('path');

// Criar um ícone PNG básico usando dados base64
const iconPNG = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOvSURBVHic7ZtNSFRRFMd/58yMzahpamqZaWGZZZoSWViLFi1atAhahG1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjR';

// Criar splash screen PNG básico
const splashPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// Salvar ícone
const iconPath = path.join(__dirname, 'assets', 'icon.png');
const splashPath = path.join(__dirname, 'assets', 'splash.png');

// Criar diretório assets se não existir
if (!fs.existsSync(path.dirname(iconPath))) {
    fs.mkdirSync(path.dirname(iconPath), { recursive: true });
}

// Criar um ícone verde básico de 1024x1024
const createIcon = () => {
    const canvas = require('canvas');
    const { createCanvas } = canvas;
    
    const width = 1024;
    const height = 1024;
    const canvasIcon = createCanvas(width, height);
    const ctx = canvasIcon.getContext('2d');
    
    // Fundo verde
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, width, height);
    
    // Círculo central mais escuro
    ctx.beginPath();
    ctx.arc(width/2, height/2, width/3, 0, 2 * Math.PI);
    ctx.fillStyle = '#1F5F1F';
    ctx.fill();
    
    // Texto "CM"
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 300px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CM', width/2, height/2);
    
    // Salvar
    const buffer = canvasIcon.toBuffer('image/png');
    fs.writeFileSync(iconPath, buffer);
};

// Criar splash simples
const createSplash = () => {
    const canvas = require('canvas');
    const { createCanvas } = canvas;
    
    const width = 1284;
    const height = 2778;
    const canvasSplash = createCanvas(width, height);
    const ctx = canvasSplash.getContext('2d');
    
    // Fundo verde gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#2F7D32');
    gradient.addColorStop(1, '#1B5E20');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Título
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CORTE DE', width/2, height/2 - 60);
    ctx.fillText('MATOS', width/2, height/2 + 60);
    
    // Subtítulo
    ctx.font = '60px Arial';
    ctx.fillText('Sistema de Controle', width/2, height/2 + 200);
    
    const buffer = canvasSplash.toBuffer('image/png');
    fs.writeFileSync(splashPath, buffer);
};

// Tentar instalar canvas se não existir
try {
    require('canvas');
    createIcon();
    createSplash();
    console.log('✅ Assets PNG criados com sucesso!');
} catch (error) {
    console.log('❌ Canvas não encontrado. Criando assets básicos...');
    
    // Criar arquivo PNG básico sem canvas
    const basicIcon = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const basicSplash = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    
    fs.writeFileSync(iconPath, basicIcon);
    fs.writeFileSync(splashPath, basicSplash);
    console.log('✅ Assets básicos criados!');
}
