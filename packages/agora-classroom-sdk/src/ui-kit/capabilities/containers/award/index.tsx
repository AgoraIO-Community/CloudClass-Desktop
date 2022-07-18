import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { SvgaPlayer, SoundPlayer } from '~ui-kit';

import RewardSVGA from '../stream/assets/svga/reward.svga';
import RewardSound from '../stream/assets/audio/reward.mp3';

export const Award = observer(() => {
  const {
    layoutUIStore: { awardAnims, removeAward },
  } = useStore();

  return (
    <div className="center-reward">
      {awardAnims.map((anim) => {
        return (
          <SvgaPlayer
            key={anim.id}
            style={{ position: 'absolute', transform: 'scale(1.5)' }}
            url={RewardSVGA}
            onFinish={() => {
              removeAward(anim.id);
            }}></SvgaPlayer>
        );
      })}
      {awardAnims.map((anim) => {
        return <SoundPlayer url={RewardSound} key={anim.id} />;
      })}
    </div>
  );
});
export default Award;
