## 実行環境

- ROS2 Humble
- rosbridge_server
- Node.js 22.21.0
- npm 11.6.2

## 実行方法

```bash
sudo apt update
sudo apt install -y ros-humble-rosbridge-suite
```

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

```bash
sudo npm install -g npm@latest
```

```bash
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```

```bash
npm install
npm run dev
```
