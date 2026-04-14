import dynamic from "next/dynamic";

const AirdropForm = dynamic(() => import("./AirdropForm"), {
    ssr: false,
});

export default function HomeContent() {
    return (
        <div>
            <AirdropForm />
        </div>
    );
}