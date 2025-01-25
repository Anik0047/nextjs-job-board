"use client";

import { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorProps } from "react-draft-wysiwyg";

// Dynamically import Editor to prevent SSR issues
const Editor = dynamic(() => import("react-draft-wysiwyg").then(mod => mod.Editor), {
    ssr: false,
});

export default forwardRef<object, EditorProps>(function RichTextEditor(props, ref) {
    const [editorLoaded, setEditorLoaded] = useState(false);
    useEffect(() => {
        setEditorLoaded(true);  // Ensure we set state only when the component is ready
    }, []);

    if (!editorLoaded) {
        return <div>Loading...</div>;
    }
    return <Editor editorClassName={cn(
        "border rounded-md px-3 min-h-[150px] cursor-text ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        props.editorClassName,
    )}
        toolbar={{
            options: ["inline", "list", "link", "history"],
            inline: {
                options: ["bold", "italic", "underline"],
            },
        }}
        editorRef={(r) => {
            if (typeof ref === "function") {
                ref(r);
            } else if (ref) {
                ref.current = r;
            }
        }}
        {...props} />;
});