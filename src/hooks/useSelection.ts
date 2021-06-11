import { useInView } from "react-intersection-observer";
import { useCallback, useEffect, useRef } from "react";
import { useSelect } from "../context";

const useSelection = ({ threshold, id }: { threshold: number; id: string }) => {
  const ref = useRef<any>();
  const [inViewRef, inView] = useInView({
    threshold,
  });
  const {
    dispatch,
    state: { selected },
  } = useSelect();

  useEffect(() => {
    if (inView && id !== selected) {
      dispatch({ type: "select", selected: id });
    }
  }, [selected, inView, dispatch, id]);

  const setRefs = useCallback(
    (node) => {
      ref.current = node;
      inViewRef(node);
    },
    [inViewRef]
  );

  return { setRefs };
};

export default useSelection;
