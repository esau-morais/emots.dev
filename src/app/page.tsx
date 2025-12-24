import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import { DecryptText } from "@/components/decrypt-text";
import { GitHubContributions } from "@/components/github-contributions";
import { getGitHubContributions } from "@/lib/github-contributions";
import { currentAge, currentCompany } from "@/utils/date";

const Home = async () => {
	const contributions = await getGitHubContributions("esau-morais");

	return (
		<div className="mx-auto max-w-3xl [counter-reset:about]">
			<div className="mb-6 pl-4 text-center text-ctp-overlay0 md:text-left">
				<h1 className="text-xl font-bold tracking-tighter text-ctp-rosewater">
					<DecryptText text="Esaú Morais" autoStart speed={40} />
				</h1>

				<p className="text-ctp-text">
					{currentAge} y/o Front-End Engineer @{" "}
					{currentCompany === "?" ? (
						<a
							className="group inline-block whitespace-nowrap"
							href="https://emots.dev/meet"
						>
							<span className="group-hover:hidden">{currentCompany}</span>
							<DecryptText
								text="HIRE ME"
								className="hidden cursor-pointer text-ctp-rosewater group-hover:inline"
								autoStart={false}
								triggerOnHover={true}
								speed={25}
							/>
						</a>
					) : (
						<DecryptText
							text={currentCompany}
							className="inline-block cursor-pointer"
							autoStart={false}
							triggerOnHover={true}
							speed={25}
						/>
					)}
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

			<GitHubContributions data={contributions} />
		</div>
	);
};

export default Home;
