import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import { currentAge, currentCompany } from "@/utils/date";

const Home = () => {
	return (
		<div className="mx-auto max-w-3xl [counter-reset:about]">
			<div className="mb-6 pl-4 text-center text-ctp-overlay0 md:text-left">
				<h1 className="text-xl font-bold tracking-tighter text-ctp-rosewater">
					Esaú Morais
				</h1>

				<p className="text-text">
					{currentAge} y/o Front-End Engineer @ {currentCompany}
				</p>
			</div>

			<p className="font-mono whitespace-normal border-l-2 border-transparent p-4 text-ctp-overlay0 transition-colors before:pr-4 before:[content:counter(about)]! before:[counter-increment:about]! hover:bg-ctp-crust focus:border-ctp-rosewater focus:bg-ctp-crust focus:outline-none">
				# Hello, there! I&apos;m Esaú [ee-saw]. I currently live in Brazil and
				I&apos;ve been learning more about web development since 2020 and my
				passion relies on building what people want. Besides that, I&apos;m a
				junior studying Software Engineering.
			</p>

			<p className="font-mono whitespace-normal border-l-2 border-transparent p-4 text-ctp-overlay0 transition-colors before:pr-4 before:[content:counter(about)]! before:[counter-increment:about]! hover:bg-ctp-crust focus:border-ctp-rosewater focus:bg-ctp-crust focus:outline-none">
				# Beyond this, I&apos;m a musician since I was young and enjoy my
				free-time watching live streams/k-dramas, working out, and more
			</p>

			<p className="font-mono group w-full whitespace-normal border-l-2 border-transparent p-4 text-ctp-overlay0 transition-colors before:pr-4 before:[content:counter(about)]! before:[counter-increment:about]! focus-within:border-ctp-rosewater focus-within:bg-ctp-crust hover:bg-ctp-crust">
				<span># Checkout my </span>
				<Link
					className="group inline-flex items-center space-x-0.5 underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ctp-rosewater focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
					href="/work"
				>
					<span>Work</span>
					<IconArrowUpRight
						className="invisible group-hover:visible group-focus-visible:visible"
						size={20}
					/>
				</Link>
			</p>
		</div>
	);
};

export default Home;
