import 'prismjs/themes/prism.css'; // Базовая тема. Есть много других тем, которые можно использовать
import Prism from 'prismjs'; // Импортируем библиотеку Prism.js
import { useEffect } from 'react';

const CodeView = (props) => {

    useEffect(() => {
        Prism.highlightAll(); // Метод подсвечивает код на странице
      }, []);

    return (
        <pre style={{height: '100%'}}>
              <code className="language-html">{props.html}</code>
        </pre>
    )
}

export default CodeView