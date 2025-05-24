import { useState, useRef, useEffect } from 'react';

// 届くチャンクの型を指定するために、EventSourceTypeを定義
// ここで定義しないと、eventDataの型が不明なため、型エラーが出る
// 具体的には、eventDataの型を指定することで、eventData.data.outputs.resultがstring型であることを保証する
// ただし、eventData.data.outputs.result以外のプロパティは、unknown型であることを保証する
interface EventSourceType {
    event: string;
    workflow_run_id: string;
    task_id: string;
        data: {
        text?: string;
        node_type?: string;
        outputs?: {
            result?: string;
            [key: string]: unknown; };  // keyが文字列、valueが不明なものが複数存在するという前提で必要。
        [key: string]: unknown; };      // any だとエラーが出るので、unknownで対応
    [key: string]: unknown; 
}


export function useWorkflowStream(){
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const eventSourceRef = useRef<EventSource | null>(null);
    const completeTextRef = useRef('');


    const callDifyApy = async () => {
        if(!input.trim()) return
        
        setOutput('処理を開始しています。。。') // 送信した直後に表示するメッセージ。チャンクが届いたら上書きする
        completeTextRef.current = '' // チャンクから渡ってきたテキストがcompleteTextRefに格納されるので、初期化しておく

        // 既存の接続があれば閉じる
        if(eventSourceRef.current) { // eventSourceRef.currentは、何度もレンダリングしないようuseRefで作成
            eventSourceRef.current.close();
        }

        const url = `/api/workflow-stream?query=${input}&userID=user-123` // apiのURLを指定
        const eventSource = new EventSource(url) // eventSourceをインスタンス化
        eventSourceRef.current = eventSource

        // チャンクが届くたびに発火
        eventSource.onmessage = (event) => {
            try {
                const eventData = JSON.parse(event.data) // 受け取ったデータをJSON.parseする
                handleEventData(eventData) // データを処理する関数を呼び出す
            } catch (error) {
                console.error('▲@useWorkflowStreamフック：データ解析エラー', error, event.data)
            }
        }

        eventSource.onerror = (error) => {
            console.error('▲@useWorkflowStreamフック：イベント取得エラー', error)
            eventSource.close() // エラーが発生したら接続を閉じる
        }
    }

    const handleEventData = (eventData: EventSourceType) => {
        console.log('▲@useWorkflowStreamフック内のeventData.eventは', eventData.event)
        // 出力例：
        // ▲@useWorkflowStreamフック内のeventData.eventは node_started
        // 298 ▲@useWorkflowStreamフック内のeventData.eventは text_chunk
        // ▲@useWorkflowStreamフック内のeventData.eventは node_finished
        // ▲@useWorkflowStreamフック内のeventData.eventは workflow_finished

        if(eventData.event === 'text_chunk'){
            appendText(eventData.data.text as string) // 受け取ったチャンクテキストを格納する
        }
        // DifyにLLMが複数あるとtext_chunkが流れてこないので、下記の処理が必要。。。(/_;)
        if(eventData.event === 'workflow_finished'){
            if(completeTextRef.current === '' || 
                completeTextRef.current ==='処理を開始しています。。。'){
                    appendText(eventData.data.outputs?.result as string) // resultはDifyの最終回答が入ってる変数
            }
            if(eventSourceRef.current) eventSourceRef.current.close() // 処理が終わったら接続を閉じる
        }
    }

    const appendText = (text: string) => {
        if(!text.trim()) return // 空文字の場合は何もしない
        completeTextRef.current += text // 受け取ったテキストを格納する
        setOutput(completeTextRef.current)
    }

    // useEffectを使ったクリーンアップ処理(初回表示でチャンクデータが残っていたら消す)
    useEffect(() => {
        return () => {
            if(eventSourceRef.current) {
                eventSourceRef.current.close() 
            }
        }
    }, []// 第2引数を[]にすると初回表示時のみ実行
    )

    return {
        input,
        setInput,
        output,
        callDifyApy,
    }

}