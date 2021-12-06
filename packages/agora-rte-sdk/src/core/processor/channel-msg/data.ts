// import { immutable } from '../../utils/decorator';
import { AgoraChatMessage, AgoraRoom, AgoraStream, AgoraUser } from './struct';
import Immutable from 'immutable';
export class AgoraRteSyncDataStore {
  private _users: Immutable.Map<string, AgoraUser> = Immutable.Map();

  get users() {
    return this._users;
  }

  setUsers(users: Map<string, AgoraUser>) {
    this._users = Immutable.Map(users);
  }

  setUser(key: string, user: AgoraUser) {
    this._users = this._users.set(key, user);
  }

  deleteUser(key: string) {
    this._users = this._users.delete(key);
  }

  findUser(userUuid: string) {
    return this._users.get(userUuid);
  }

  private _roomProperties = Immutable.Map({});

  get roomProperties() {
    return this._roomProperties;
  }

  setRoomProperties(roomProperties: any) {
    this._roomProperties = Immutable.Map(roomProperties);
    // this._roomProperties = Properties.fromData(roomProperties);
  }

  private _streams: Immutable.Map<string, AgoraStream> = Immutable.Map<string, AgoraStream>();

  get streams() {
    return this._streams;
  }

  setStreams(streams: Map<string, AgoraStream>) {
    this._streams = Immutable.Map(streams);
  }

  findUserStreams(userUuid: string) {
    return Array.from(this._streams.values()).filter((s) => s.fromUser.userUuid === userUuid);
  }

  setStream(key: string, stream: AgoraStream) {
    this._streams = this._streams.set(key, stream);
  }

  deleteStream(key: string) {
    this._streams = this._streams.delete(key);
  }

  findStream(streamUuid: string) {
    return this._streams.get(streamUuid);
  }

  private _roomInfo = Immutable.Map();

  get roomInfo() {
    return this._roomInfo;
  }

  setRoomInfo(roomInfo: AgoraRoom) {
    this._roomInfo = Immutable.Map(roomInfo);
  }

  private readonly _messages: Immutable.List<AgoraChatMessage> = Immutable.List([]);

  get messages() {
    return this._messages;
  }

  addMessage(message: AgoraChatMessage) {
    this._messages.push(message);
  }
}
