import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    text-align: center;
    background-image: url('https://i.pinimg.com/originals/22/4f/ca/224fcaf16475d57dc38aa285a0ca07e6.jpg');
    background-size: cover;
    background-position: center;
`;

const TextArea = styled.textarea`
    width: 100%;
    height: 100px;
    margin-top: 10px;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid #ccc;
    white-space: pre-wrap;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid #ccc;
`;

const Button = styled.button`
    padding: 10px 20px;
    margin-top: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: #0056b3;
    }
`;

const SampleText = styled.p`
    font-size: 16px;
    text-align: left;
    white-space: pre-wrap;
    word-wrap: break-word;
    background: rgba(255, 255, 255, 0.8);
    padding: 10px;
    border-radius: 5px;
`;

const HighlightedText = styled.span`
    color: ${(props) => (props.isCorrect ? 'black' : 'red')};
`;

const RankingList = styled.ol`
    margin-top: 20px;
    background: rgba(255, 255, 255, 0.8);
    padding: 20px;
    border-radius: 5px;
    list-style-position: inside;
`;

const TypingSpeedTest = () => {
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [sampleText, setSampleText] = useState('');
    const [timer, setTimer] = useState(30);
    const [isActive, setIsActive] = useState(false);
    const [correctWordsCount, setCorrectWordsCount] = useState(0);
    const [attempts, setAttempts] = useState([]);
    const [hasTyped, setHasTyped] = useState(false);
    const textInputRef = useRef(null);

    useEffect(() => {
        fetch('/sampleText.txt')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then((data) => {
                setSampleText(data);
            })
            .catch((error) => {
                console.error('Error fetching the sample text:', error);
            });
    }, []);

    useEffect(() => {
        let interval = null;
        if (isActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timer === 0 && isActive) {
            clearInterval(interval);
            setIsActive(false);
            recordAttempt();
        }
        return () => clearInterval(interval);
    }, [isActive, timer]);

    const handleStart = () => {
        if (name.trim() === '') {
            alert('Enter Your Name');
            return;
        }
        setIsActive(true);
        setText('');
        setCorrectWordsCount(0);
        setTimer(30);
        setHasTyped(false);
        textInputRef.current.focus();
    };

    const handleChange = (e) => {
        const inputText = e.target.value;
        setText(inputText);
        calculateCorrectWords(inputText);
        setHasTyped(true);
    };

    const calculateCorrectWords = (inputText) => {
        const inputWords = inputText.trim().split(/\s+/);
        const sampleWords = sampleText.trim().split(/\s+/);
        let correctCount = 0;

        inputWords.forEach((word, index) => {
            if (word === sampleWords[index]) {
                correctCount++;
            }
        });

        setCorrectWordsCount(correctCount);
    };

    const recordAttempt = () => {
        const wpm = correctWordsCount * 2;
        setAttempts((prevAttempts) => {
            const updatedAttempts = [...prevAttempts, { name, wpm }];
            updatedAttempts.sort((a, b) => b.wpm - a.wpm);
            return updatedAttempts;
        });
    };

    const renderTextWithHighlights = () => {
        const userChars = text.split('');
        const sampleChars = sampleText.split('');
        return sampleChars.map((char, index) => (
            <HighlightedText key={index} isCorrect={userChars[index] === char}>
                {char}
            </HighlightedText>
        ));
    };

    return (
        <Container>
            <h2>Typing Speed Test</h2>
            <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <SampleText>{renderTextWithHighlights()}</SampleText>
            <TextArea
                ref={textInputRef}
                value={text}
                onChange={handleChange}
                disabled={!isActive || timer === 0}
                placeholder="Start typing here when you are ready!!"
            />
            <Button onClick={handleStart} disabled={isActive}>
                {isActive ? 'Typing...' : 'Start'}
            </Button>
            <h3>Time Remaining: {timer}s</h3>
            <h3>Correct Words: {correctWordsCount}</h3>
            {hasTyped && attempts.length > 0 && (
                <RankingList>
                    <h4>Ranking:</h4>
                    {attempts.map((attempt, index) => (
                        <li key={index}>
                            {attempt.name}: {attempt.wpm} WPM
                        </li>
                    ))}
                </RankingList>
            )}
        </Container>
    );
};

export default TypingSpeedTest;
