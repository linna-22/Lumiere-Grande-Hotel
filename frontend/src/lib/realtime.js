import { echo } from './echo'

export function listenNotifications(callback) {
  const channel = echo.channel('notifications')
  channel.listen('.notification.alert', callback)

  return () => {
    channel.stopListening('.notification.alert', callback)
    echo.leaveChannel('notifications')
  }
}

export function listenRoomUpdates(callback) {
  const channel = echo.channel('rooms-board')
  channel.listen('.room.updated', callback)

  return () => {
    channel.stopListening('.room.updated', callback)
    echo.leaveChannel('rooms-board')
  }
}
