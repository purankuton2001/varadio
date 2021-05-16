import {number, string} from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

export default function PostButton(props) {
  const {size, color} = props;
  return (
    <View>
      <Svg
        width={size}
        height={(size * 13) / 14}
        viewBox="0 0 70 65"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M37.19 12.2089C32.0163 12.6993 27.1853 14.9599 23.5199 18.6055L39.4648 34.465L16.9873 34.393C17.0039 39.5653 18.8232 44.5834 22.1351 48.5922C25.4471 52.6011 30.0467 55.3526 35.1503 56.378C40.2539 57.4034 45.5458 56.6393 50.1242 54.2157C54.7026 51.7922 58.2842 47.8593 60.2589 43.087C62.2336 38.3148 62.4791 32.9986 60.9536 28.0441C59.428 23.0897 56.2259 18.8036 51.8928 15.9161C47.5596 13.0287 42.3636 11.7185 37.19 12.2089ZM45.9601 30.361C48.0538 31.3373 50.5359 30.4457 51.504 28.3695C52.4721 26.2934 51.5597 23.8188 49.466 22.8426C47.3724 21.8663 44.8903 22.7579 43.9222 24.8341C42.954 26.9102 43.8665 29.3848 45.9601 30.361ZM23.7301 30.929L6.31536 30.7285L6.30283 33.1013L23.7176 33.3018L23.7301 30.929ZM26.6947 25.1381L15.3472 11.9265L13.5376 13.4613L24.8851 26.6729L26.6947 25.1381Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

PostButton.propTypes = {
  size: number,
  color: string,
};

PostButton.defaultProps = {
  size: 80,
  color: 'white',
};
