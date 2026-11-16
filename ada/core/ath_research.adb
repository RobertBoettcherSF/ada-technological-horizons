with Ada.Unchecked_Conversion;
with Ath_Growth;

package body Ath_Research is
   use type Ath_Growth.Status_Code;
   procedure Clear
     (Discoveries, Researchers, Ratio : out Long_Float;
      Axis_X_Max, Index_Max, Ratio_Max : out Long_Float;
      Times, Discovery_Samples, Researcher_Samples, Ratio_Samples : out Sample_Values) is
   begin
      Discoveries := 0.0;
      Researchers := 0.0;
      Ratio := 0.0;
      Axis_X_Max := 0.0;
      Index_Max := 0.0;
      Ratio_Max := 0.0;
      Times := (others => 0.0);
      Discovery_Samples := (others => 0.0);
      Researcher_Samples := (others => 0.0);
      Ratio_Samples := (others => 0.0);
   end Clear;

   function Finite (Value : Long_Float) return Boolean is
      type Bits is mod 2 ** 64;
      function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);
      Exponent : constant Bits := (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Finite;

   procedure Compare
     (Discoveries_0, Researchers_0, Discovery_Doubling, Researcher_Doubling, Elapsed : Long_Float;
      Discoveries, Researchers, Ratio : out Long_Float;
      Axis_X_Max, Index_Max, Ratio_Max : out Long_Float;
      Times, Discovery_Samples, Researcher_Samples, Ratio_Samples : out Sample_Values;
      Status : out Status_Code) is
      Discovery_Factor : Long_Float;
      Researcher_Factor : Long_Float;
      Discovery_Times : Ath_Growth.Sample_Times;
      Researcher_Times : Ath_Growth.Sample_Times;
      Discovery_Curve : Ath_Growth.Sample_Quantities;
      Researcher_Curve : Ath_Growth.Sample_Quantities;
      Growth_Status : Ath_Growth.Status_Code;
   begin
      Clear
        (Discoveries, Researchers, Ratio, Axis_X_Max, Index_Max, Ratio_Max,
         Times, Discovery_Samples, Researcher_Samples, Ratio_Samples);
      if not Finite (Discoveries_0) or else not Finite (Researchers_0)
        or else not Finite (Discovery_Doubling) or else not Finite (Researcher_Doubling)
        or else not Finite (Elapsed)
      then
         Status := Non_Finite_Input;
         return;
      end if;
      if Discoveries_0 <= 0.0 or else Researchers_0 <= 0.0 then
         Status := Index_Not_Positive;
         return;
      end if;
      if Elapsed < 0.0 then
         Status := Elapsed_Negative;
         return;
      end if;
      if Discovery_Doubling <= 0.0 or else Researcher_Doubling <= 0.0 then
         Status := Doubling_Not_Positive;
         return;
      end if;

      Ath_Growth.Grow
        (Discoveries_0, Discovery_Doubling, Elapsed,
         Discoveries, Discovery_Factor, Discovery_Times, Discovery_Curve, Growth_Status);
      if Growth_Status /= Ath_Growth.Ok then
         Clear
           (Discoveries, Researchers, Ratio, Axis_X_Max, Index_Max, Ratio_Max,
            Times, Discovery_Samples, Researcher_Samples, Ratio_Samples);
         Status := Result_Not_Finite;
         return;
      end if;
      Ath_Growth.Grow
        (Researchers_0, Researcher_Doubling, Elapsed,
         Researchers, Researcher_Factor, Researcher_Times, Researcher_Curve, Growth_Status);
      if Growth_Status /= Ath_Growth.Ok or else Researchers = 0.0 then
         Clear
           (Discoveries, Researchers, Ratio, Axis_X_Max, Index_Max, Ratio_Max,
            Times, Discovery_Samples, Researcher_Samples, Ratio_Samples);
         Status := Result_Not_Finite;
         return;
      end if;
      Ratio := Discoveries / Researchers;
      if not Finite (Ratio) then
         Clear
           (Discoveries, Researchers, Ratio, Axis_X_Max, Index_Max, Ratio_Max,
            Times, Discovery_Samples, Researcher_Samples, Ratio_Samples);
         Status := Result_Not_Finite;
         return;
      end if;

      Axis_X_Max := Elapsed;
      Index_Max := 0.0;
      Ratio_Max := 0.0;
      for Index in 1 .. Ath_Growth.Sample_Count loop
         Times (Index) := Discovery_Times (Index);
         Discovery_Samples (Index) := Discovery_Curve (Index);
         Researcher_Samples (Index) := Researcher_Curve (Index);
         if Researcher_Curve (Index) = 0.0 or else not Finite (Researcher_Curve (Index))
           or else not Finite (Discovery_Curve (Index))
         then
            Clear
              (Discoveries, Researchers, Ratio, Axis_X_Max, Index_Max, Ratio_Max,
               Times, Discovery_Samples, Researcher_Samples, Ratio_Samples);
            Status := Result_Not_Finite;
            return;
         end if;
         Ratio_Samples (Index) := Discovery_Curve (Index) / Researcher_Curve (Index);
         if not Finite (Ratio_Samples (Index)) then
            Clear
              (Discoveries, Researchers, Ratio, Axis_X_Max, Index_Max, Ratio_Max,
               Times, Discovery_Samples, Researcher_Samples, Ratio_Samples);
            Status := Result_Not_Finite;
            return;
         end if;
         if Discovery_Curve (Index) > Index_Max then
            Index_Max := Discovery_Curve (Index);
         end if;
         if Researcher_Curve (Index) > Index_Max then
            Index_Max := Researcher_Curve (Index);
         end if;
         if Ratio_Samples (Index) > Ratio_Max then
            Ratio_Max := Ratio_Samples (Index);
         end if;
      end loop;
      Status := Ok;
   end Compare;
end Ath_Research;
