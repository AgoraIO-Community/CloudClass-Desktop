import { AGEventEmitter } from '../src/core/utils/events';

describe('AGEventEmitter', () => {
  test('#once', () => {
    const agEvent = new AGEventEmitter();
    let count = 0;
    agEvent
      .once('event1', (...args: any[]) => {
        expect(args[0]).toEqual(1);
        expect(args[1]).toEqual(2);
        ++count;
      })
      .emit('event1', 1, 2)
      .emit('event1', 1, 2);
    expect(count).toBe(1);
  });

  test('#on', () => {
    const agEvent = new AGEventEmitter();
    agEvent
      .on('event1', (...args: any[]) => {
        expect(args[0]).toEqual(1);
        expect(args[1]).toEqual(2);
      })
      .emit('event1', 1, 2);
  });

  test('#off', () => {
    const agEvent = new AGEventEmitter();
    const cb = (...args: any[]) => {
      expect(args[0]).toEqual(1);
      expect(args[1]).toEqual(2);
    };
    // expect(agEvent._eventMap.size).toBe(0);
    // agEvent.on('event1', cb).off('event1', cb).emit('event1', 1, 2);
    // expect(agEvent._eventMap.get('event1')!.length).toBe(0);
  });

  test('#removeAllEventListeners', () => {
    const agEvent = new AGEventEmitter();
    const cb = (...args: any[]) => {
      expect(args[0]).toEqual(1);
      expect(args[1]).toEqual(2);
    };
    agEvent.on('event1', cb);
    // expect(agEvent._eventMap.size).toBe(1);
    // agEvent.removeAllEventListeners();
    // expect(agEvent._eventMap.size).toBe(0);
  });
});
