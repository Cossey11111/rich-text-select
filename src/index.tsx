import ReactDOM from "react-dom";
import Expression from './Expression';

const options = [
    {
      key: 'option1',
      label: 'option1'
    },
    {
      key: 'option2',
      label: 'option2'
    },
    {
      key: 'option3',
      label: 'option3'
    },
    {
      key: 'option4',
      label: 'option4'
    },
    {
      key: 'option5',
      label: 'option5'
    },
]

ReactDOM.render(
    <Expression options={options}/>,
    document.getElementById("root")
);