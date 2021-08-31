import React from 'react';

import './selectItem.css';

// export type SelectItemType = {
//     isSelected: boolean;
//     name: string;
//     from: string;
//     onClick: () => void;
// }

const SelectItem = (props) => {
    return (
        <div 
            className="mainWrapperConv"
            style={{
                backgroundColor: props.isSelected ? '#E5E5E5' : 'white',
                borderBottom: '#E5E5E5',
                borderBottomWidth: 1,
            }}
            onClick={props.onClick}
            >

            <div className="convInnerContainer">
                <input className="convInnerContainCheck" type="checkbox" defaultChecked={false} onChange={() => console.log('pressed')} />
                <div className="convInnerContainerDetails">
                    <h3>{props.name}</h3>
                    <h5>{props.from}</h5>
                </div>
            </div>
        </div>
    );
};

SelectItem.defaultProps = {
    isSelected: false,
    name: 'VH Praneeth',
    from: 'Facebook DM',
    onClick: () => console.log("SelectItem clicked!"),
};

export default SelectItem;
