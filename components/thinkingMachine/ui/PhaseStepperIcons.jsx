const STROKE = "#FFFFFF";
const STROKE_WIDTH = 1.83333;

function PhaseStepIcon({ size = 22, children, viewBox = "0 0 24 24" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IdeaStepIcon({ size = 21.33 }) {
  return (
    <PhaseStepIcon size={size}>
      <path
        d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"
        fill={STROKE}
      />
    </PhaseStepIcon>
  );
}

export function ResearchStepIcon({ size = 22 }) {
  return (
    <PhaseStepIcon size={size}>
      <path
        d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
        stroke={STROKE}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </PhaseStepIcon>
  );
}

export function SolutionStepIcon({ size = 22 }) {
  return (
    <PhaseStepIcon size={size}>
      <path
        d="M12 13.5v-6m-3 3h6m-5.1 8.7 1.46 1.947c.217.29.326.434.459.486a.5.5 0 0 0 .362 0c.133-.052.242-.197.459-.486L14.1 19.2c.293-.39.44-.586.619-.735a2 2 0 0 1 .822-.412c.226-.053.47-.053.959-.053 1.398 0 2.097 0 2.648-.228a3 3 0 0 0 1.624-1.624C21 15.597 21 14.898 21 13.5V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C18.72 3 17.88 3 16.2 3H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C3 5.28 3 6.12 3 7.8v5.7c0 1.398 0 2.097.228 2.648a3 3 0 0 0 1.624 1.624C5.403 18 6.102 18 7.5 18c.489 0 .733 0 .96.053a2 2 0 0 1 .821.412c.18.149.326.344.619.735Z"
        stroke={STROKE}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </PhaseStepIcon>
  );
}

export function DecisionStepIcon({ size = 22 }) {
  return (
    <PhaseStepIcon size={size}>
      <path
        d="m9 11 2 2 4.5-4.5M9.9 19.2l1.46 1.947c.217.29.326.434.459.486a.5.5 0 0 0 .362 0c.133-.052.242-.197.459-.486L14.1 19.2c.293-.39.44-.586.619-.735a2 2 0 0 1 .822-.412c.226-.053.47-.053.959-.053 1.398 0 2.097 0 2.648-.228a3 3 0 0 0 1.624-1.624C21 15.597 21 14.898 21 13.5V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C18.72 3 17.88 3 16.2 3H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C3 5.28 3 6.12 3 7.8v5.7c0 1.398 0 2.097.228 2.648a3 3 0 0 0 1.624 1.624C5.403 18 6.102 18 7.5 18c.489 0 .733 0 .96.053a2 2 0 0 1 .821.412c.18.149.326.344.619.735Z"
        stroke={STROKE}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </PhaseStepIcon>
  );
}

export function ActionStepIcon({ size = 22 }) {
  return (
    <PhaseStepIcon size={size}>
      <path
        d="M13 2 4.093 12.688c-.348.418-.523.628-.525.804a.5.5 0 0 0 .185.397c.138.111.41.111.955.111H12l-1 8 8.907-10.688c.348-.418.523-.628.525-.804a.5.5 0 0 0-.185-.397c-.138-.111-.41-.111-.955-.111H12l1-8Z"
        stroke={STROKE}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </PhaseStepIcon>
  );
}

const PHASE_STEP_BUTTON_STYLE = {
  width: "32px",
  height: "32px",
  boxShadow:
    "inset 0.761905px 0.761905px 0.761905px rgba(255, 255, 255, 0.8), inset 0px -0.761905px 1.52381px #B4D7D5",
  borderRadius: "761.143px",
};

export function PhaseStepButton({ active = false, title, children }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center text-white transition-transform active:scale-95"
      style={{
        ...PHASE_STEP_BUTTON_STYLE,
        background: active ? "#62B8AA" : "#CCE9E7",
      }}
      title={title}
    >
      {children}
    </button>
  );
}
