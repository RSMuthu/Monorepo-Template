import PropTypes from 'prop-types'
import './SampleButton.scss'

export default function SampleButton ({ label, isDisabled, bgColor, onClick }) {
  return (
    <button
      className='btn'
      onClick={onClick}
      disabled={isDisabled}
      style={{
        backgroundColor: bgColor,
      }}
    >
      {label}
    </button>
  )
}

SampleButton.defaultProps = {
  bgColor: 'red',
  label: 'Press ME',
  isDisabled: false,
}

SampleButton.propTypes = {
  label: PropTypes.string,
  bgColor: PropTypes.string,
  onClick: PropTypes.func,
  isDisabled: PropTypes.bool,
}
