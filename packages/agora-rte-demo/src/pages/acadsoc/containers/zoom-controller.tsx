import React from 'react';
import { ControlMenu, ControlMenuProps } from 'agora-aclass-ui-kit';

export interface ZoomControllerProps extends ControlMenuProps {
  lockBoard?: boolean,
  zoomScale: number,
  zoomChange: (scale: number) => void,
  changeFooterMenu: (type: string) => void,
  onFullScreen: () => any,
  onExitFullScreen: () => any,
}

export class ZoomController extends React.Component<ZoomControllerProps, {}> {

    private static readonly syncDuration: number = 200;

    private static readonly dividingRule: ReadonlyArray<number> = Object.freeze(
        [
            0.10737418240000011,
            0.13421772800000012,
            0.16777216000000014,
            0.20971520000000016,
            0.26214400000000015,
            0.3276800000000002,
            0.4096000000000002,
            0.5120000000000001,
            0.6400000000000001,
            0.8,
            1,
            1.26,
            1.5876000000000001,
            2.000376,
            2.5204737600000002,
            3.1757969376000004,
            4.001504141376,
            5.041895218133761,
            6.352787974848539,
            8.00451284830916,
            10,
        ],
    );

    private tempRuleIndex?: number;
    private syncRuleIndexTimer: any = null;

    public constructor(props: ZoomControllerProps) {
        super(props);
    }

    private delaySyncRuleIndex(): void {
        if (this.syncRuleIndexTimer !== null) {
            clearTimeout(this.syncRuleIndexTimer);
            this.syncRuleIndexTimer = null;
        }
        this.syncRuleIndexTimer = setTimeout(() => {
            this.syncRuleIndexTimer = null;
            this.tempRuleIndex = undefined;

        }, ZoomController.syncDuration);
    }

    private static readRuleIndexByScale(scale: number): number {
        const { dividingRule } = ZoomController;

        if (scale < dividingRule[0]) {
            return 0;
        }
        for (let i = 0; i < dividingRule.length; ++i) {
            const prePoint = dividingRule[i - 1];
            const point = dividingRule[i];
            const nextPoint = dividingRule[i + 1];

            const begin = prePoint === undefined ? Number.MIN_SAFE_INTEGER : (prePoint + point) / 2;
            const end = nextPoint === undefined ? Number.MAX_SAFE_INTEGER : (nextPoint + point) / 2;

            if (scale >= begin && scale <= end) {
                return i;
            }
        }
        return dividingRule.length - 1;
    }

    private moveTo100(): void {
        this.tempRuleIndex = ZoomController.readRuleIndexByScale(1);
        this.delaySyncRuleIndex();
        this.props.zoomChange(1);
    }


    private moveRuleIndex(deltaIndex: number): void {

        if (this.tempRuleIndex === undefined) {
            this.tempRuleIndex = ZoomController.readRuleIndexByScale(this.props.zoomScale);
        }
        this.tempRuleIndex += deltaIndex;

        if (this.tempRuleIndex > ZoomController.dividingRule.length - 1) {
            this.tempRuleIndex = ZoomController.dividingRule.length - 1;

        } else if (this.tempRuleIndex < 0) {
            this.tempRuleIndex = 0;
        }
        const targetScale = ZoomController.dividingRule[this.tempRuleIndex];

        this.delaySyncRuleIndex();
        this.props.zoomChange(targetScale);
    }

    public render(): React.ReactNode {
        return (
          <ControlMenu
            style={{
              ...this.props.style
            }}
            showPaginator={this.props.showPaginator}
            currentPage={this.props.currentPage}
            totalPage={this.props.totalPage}
            showScale={this.props.showScale}
            scale={this.props.scale}
            showControlScreen={this.props.showControlScreen}
            isFullScreen={this.props.isFullScreen}
            onClick={(type: string) => {
              if ('min' === type) {
                this.moveRuleIndex(-1)
                return
              }
              if ('plus' === type) {
                this.moveRuleIndex(+1)
                return
              }
              if (['prev', 'next'].includes(type)) {
                this.props.changeFooterMenu(`${type}_page`)
              }
            }}
          />
        );
    }
}