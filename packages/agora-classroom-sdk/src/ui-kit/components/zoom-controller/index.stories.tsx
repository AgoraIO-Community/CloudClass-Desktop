import React from 'react';
import { Meta } from '@storybook/react';
import { ZoomController } from '~components/zoom-controller'

const meta: Meta = {
    title: 'Components/ZoomController',
    component: ZoomController
}

type DocsType = {
    zoomValue: number;
    currentPage: number;
    totalPage: number;
}

export const Docs = ({ zoomValue, currentPage, totalPage }: DocsType) => (
    <>
        <div className="mt-20">
            <ZoomController
                zoomValue={zoomValue}
                currentPage={currentPage}
                totalPage={totalPage}
                clickHandler={e => {
                    console.log('zoom item type ', e)
                }}
            />
        </div>
    </>
)


Docs.args = {
    zoomValue: 20,
    currentPage: 1,
    totalPage: 21,
}

export default meta;