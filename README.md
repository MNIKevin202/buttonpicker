# ButtonPicker - CapRover Ready

This is a web version of the ButtonPicker streaming utility, converted from Electron to work with CapRover.

## Features

- **Battle Royale Challenge Picker** - Random challenges for Battle Royale games
- **Button Picker** - Random button picker for challenges and giveaways
- **Fortnite Fashion Show Picker** - Random challenges for fashion shows
- **Coin Flip** - Simple coin flip utility
- **Wheel Spin** - Random wheel spinner

## CapRover Deployment

1. **Create a new app** in your CapRover dashboard
2. **Set the port** to `3117` in the app settings
3. **Enable HTTPS** and configure your domain
4. **Deploy** using the CapRover CLI or GitHub integration

### Manual Deployment

```bash
# Clone the repository
git clone https://github.com/MNIKevin202/buttonpicker.git
cd buttonpicker

# Deploy to CapRover
caprover deploy
```

### Docker Build (if needed)

```bash
docker build -t buttonpicker .
docker run -p 3117:3117 buttonpicker
```

## Configuration

- **Port**: 3117 (configured for CapRover)
- **Environment**: Production-ready with Express.js server
- **Data Storage**: JSON files for picker data persistence

## API Endpoints

- `GET /api/picker-data/:pickerType` - Get picker data
- `POST /api/picker-data/:pickerType` - Save picker data

## Local Development

```bash
npm install
npm start
```

The application will be available at `http://localhost:3117`
