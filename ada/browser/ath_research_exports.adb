with Ath_Research;

package body Ath_Research_Exports is
   use type Ath_Research.Status_Code;

   Stored_Discoveries : Long_Float := 0.0;
   Stored_Researchers : Long_Float := 0.0;
   Stored_Ratio : Long_Float := 0.0;
   Stored_X : Long_Float := 0.0;
   Stored_Index_Max : Long_Float := 0.0;
   Stored_Ratio_Max : Long_Float := 0.0;
   Stored_Ready : Boolean := False;
   Stored_Times : Ath_Research.Sample_Values := (others => 0.0);
   Stored_Discovery_Samples : Ath_Research.Sample_Values := (others => 0.0);
   Stored_Researcher_Samples : Ath_Research.Sample_Values := (others => 0.0);
   Stored_Ratio_Samples : Ath_Research.Sample_Values := (others => 0.0);

   procedure Clear is
   begin
      Stored_Discoveries := 0.0;
      Stored_Researchers := 0.0;
      Stored_Ratio := 0.0;
      Stored_X := 0.0;
      Stored_Index_Max := 0.0;
      Stored_Ratio_Max := 0.0;
      Stored_Ready := False;
      Stored_Times := (others => 0.0);
      Stored_Discovery_Samples := (others => 0.0);
      Stored_Researcher_Samples := (others => 0.0);
      Stored_Ratio_Samples := (others => 0.0);
   end Clear;

   function Ath_Research_F64
     (Discoveries_0, Researchers_0, Discovery_Doubling, Researcher_Doubling, Elapsed : Long_Float)
      return Interfaces.Integer_32 is
      Status : Ath_Research.Status_Code;
   begin
      Ath_Research.Compare
        (Discoveries_0, Researchers_0, Discovery_Doubling, Researcher_Doubling, Elapsed,
         Stored_Discoveries, Stored_Researchers, Stored_Ratio,
         Stored_X, Stored_Index_Max, Stored_Ratio_Max,
         Stored_Times, Stored_Discovery_Samples, Stored_Researcher_Samples, Stored_Ratio_Samples,
         Status);
      Stored_Ready := Status = Ath_Research.Ok;
      if not Stored_Ready then
         Clear;
      end if;
      return Interfaces.Integer_32 (Status);
   end Ath_Research_F64;

   function Ath_Research_Discoveries return Long_Float is
   begin
      return Stored_Discoveries;
   end Ath_Research_Discoveries;

   function Ath_Research_Researchers return Long_Float is
   begin
      return Stored_Researchers;
   end Ath_Research_Researchers;

   function Ath_Research_Ratio return Long_Float is
   begin
      return Stored_Ratio;
   end Ath_Research_Ratio;

   function Ath_Research_X_Max return Long_Float is
   begin
      return Stored_X;
   end Ath_Research_X_Max;

   function Ath_Research_Index_Max return Long_Float is
   begin
      return Stored_Index_Max;
   end Ath_Research_Index_Max;

   function Ath_Research_Ratio_Max return Long_Float is
   begin
      return Stored_Ratio_Max;
   end Ath_Research_Ratio_Max;

   function Ath_Research_Sample_Count return Interfaces.Integer_32 is
   begin
      if not Stored_Ready then
         return 0;
      end if;
      return Ath_Research.Sample_Count;
   end Ath_Research_Sample_Count;

   function In_Range (Index : Interfaces.Integer_32) return Boolean is
   begin
      return Stored_Ready and then Index >= 1 and then Index <= Ath_Research.Sample_Count;
   end In_Range;

   function Ath_Research_Sample_Time
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not In_Range (Index) then
         return 0.0;
      end if;
      return Stored_Times (Natural (Index));
   end Ath_Research_Sample_Time;

   function Ath_Research_Sample_Discoveries
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not In_Range (Index) then
         return 0.0;
      end if;
      return Stored_Discovery_Samples (Natural (Index));
   end Ath_Research_Sample_Discoveries;

   function Ath_Research_Sample_Researchers
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not In_Range (Index) then
         return 0.0;
      end if;
      return Stored_Researcher_Samples (Natural (Index));
   end Ath_Research_Sample_Researchers;

   function Ath_Research_Sample_Ratio
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not In_Range (Index) then
         return 0.0;
      end if;
      return Stored_Ratio_Samples (Natural (Index));
   end Ath_Research_Sample_Ratio;
end Ath_Research_Exports;
