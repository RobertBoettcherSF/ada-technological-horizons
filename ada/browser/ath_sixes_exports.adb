with Ath_Sixes;

package body Ath_Sixes_Exports is
   use type Interfaces.Integer_32;

   Stored_Chance : Long_Float := 0.0;
   Stored_Egg_Chance : Long_Float := 0.0;
   Stored_Expected : Long_Float := 0.0;
   Player_Trials : Ath_Sixes.Sample_Values := (others => 0.0);
   Chances : Ath_Sixes.Sample_Values := (others => 0.0);
   Xs : Ath_Sixes.Sample_Values := (others => 0.0);
   Egg_N : Ath_Sixes.Sample_Values := (others => 0.0);
   Egg_C : Ath_Sixes.Sample_Values := (others => 0.0);
   Egg_X : Ath_Sixes.Sample_Values := (others => 0.0);
   Ready : Boolean := False;

   procedure Ensure_Samples is
      Expect : Ath_Sixes.Sample_Values;
   begin
      if Ready then
         return;
      end if;
      Ath_Sixes.Player_Samples (Player_Trials, Chances, Xs);
      Ath_Sixes.Egg_Samples (Egg_N, Egg_C, Expect, Egg_X);
      Ready := True;
   end Ensure_Samples;

   function Ath_Sixes_Single return Long_Float is
   begin
      return Ath_Sixes.Single_Chance;
   end Ath_Sixes_Single;

   function Ath_Sixes_Chance (Trials : Long_Float) return Interfaces.Integer_32 is
      Status : Ath_Sixes.Status_Code;
   begin
      Ath_Sixes.At_Least_One
        (Trials, Ath_Sixes.Single_Chance, Stored_Chance, Status);
      Ensure_Samples;
      return Interfaces.Integer_32 (Status);
   end Ath_Sixes_Chance;

   function Ath_Sixes_Chance_Value return Long_Float is
   begin
      return Stored_Chance;
   end Ath_Sixes_Chance_Value;

   function Ath_Sixes_Caption return Interfaces.Integer_32 is
   begin
      return Ath_Sixes.Caption (Stored_Chance);
   end Ath_Sixes_Caption;

   function Ath_Sixes_Players_Of (Slider : Long_Float) return Long_Float is
   begin
      return Ath_Sixes.Players_Of (Slider);
   end Ath_Sixes_Players_Of;

   function Ath_Sixes_Slider_Of (Players : Long_Float) return Long_Float is
   begin
      return Ath_Sixes.Slider_Of_Players (Players);
   end Ath_Sixes_Slider_Of;

   function Ath_Sixes_Sample_Count return Interfaces.Integer_32 is
   begin
      return Ath_Sixes.Sample_Count;
   end Ath_Sixes_Sample_Count;

   function Sample_Ok (Index : Interfaces.Integer_32) return Boolean is
   begin
      return Ready and then Index >= 1 and then Index <= Ath_Sixes.Sample_Count;
   end Sample_Ok;

   function Ath_Sixes_Sample_Players (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Player_Trials (Positive (Index));
   end Ath_Sixes_Sample_Players;

   function Ath_Sixes_Sample_Chance (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Chances (Positive (Index));
   end Ath_Sixes_Sample_Chance;

   function Ath_Sixes_Sample_X (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Xs (Positive (Index));
   end Ath_Sixes_Sample_X;

   function Ath_Sixes_Egg_Count return Long_Float is
   begin
      return Ath_Sixes.Egg_Count;
   end Ath_Sixes_Egg_Count;

   function Ath_Sixes_Egg_Single return Long_Float is
   begin
      return Ath_Sixes.Egg_Single;
   end Ath_Sixes_Egg_Single;

   function Ath_Sixes_Eggs_Of (Slider : Long_Float) return Long_Float is
   begin
      return Ath_Sixes.Eggs_Of (Slider);
   end Ath_Sixes_Eggs_Of;

   function Ath_Sixes_Egg_Slider (Eggs : Long_Float) return Long_Float is
   begin
      return Ath_Sixes.Slider_Of_Eggs (Eggs);
   end Ath_Sixes_Egg_Slider;

   function Ath_Sixes_Egg_Chance (Eggs : Long_Float) return Interfaces.Integer_32 is
      Status : Ath_Sixes.Status_Code;
   begin
      Ath_Sixes.At_Least_One (Eggs, Ath_Sixes.Egg_Single, Stored_Egg_Chance, Status);
      if Status = Ath_Sixes.Ok then
         Stored_Expected := Eggs * Ath_Sixes.Egg_Single;
      else
         Stored_Expected := 0.0;
      end if;
      Ensure_Samples;
      return Interfaces.Integer_32 (Status);
   end Ath_Sixes_Egg_Chance;

   function Ath_Sixes_Egg_Chance_Value return Long_Float is
   begin
      return Stored_Egg_Chance;
   end Ath_Sixes_Egg_Chance_Value;

   function Ath_Sixes_Egg_Expected return Long_Float is
   begin
      return Stored_Expected;
   end Ath_Sixes_Egg_Expected;

   function Ath_Sixes_Egg_Sample_Eggs (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Egg_N (Positive (Index));
   end Ath_Sixes_Egg_Sample_Eggs;

   function Ath_Sixes_Egg_Sample_Chance (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Egg_C (Positive (Index));
   end Ath_Sixes_Egg_Sample_Chance;

   function Ath_Sixes_Egg_Sample_X (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Egg_X (Positive (Index));
   end Ath_Sixes_Egg_Sample_X;

   function Ath_Sixes_Roll (Set_Index : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      if Set_Index < 1 then
         return 2;
      end if;
      Ath_Sixes.Roll (Positive (Set_Index));
      return 0;
   end Ath_Sixes_Roll;

   function Ath_Sixes_Face (Die : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      if Die < 1 then
         return 0;
      end if;
      return Ath_Sixes.Face (Positive (Die));
   end Ath_Sixes_Face;

   function Ath_Sixes_Six_Count return Interfaces.Integer_32 is
   begin
      return Ath_Sixes.Six_Count;
   end Ath_Sixes_Six_Count;

   function Ath_Sixes_Expected (Players : Long_Float) return Long_Float is
   begin
      return Ath_Sixes.Expected_Winners (Players);
   end Ath_Sixes_Expected;

   function Ath_Sixes_Crowd_Count return Interfaces.Integer_32 is
   begin
      return Ath_Sixes.Crowd_Count;
   end Ath_Sixes_Crowd_Count;

   function Ath_Sixes_Crowd_Group (Players : Long_Float) return Long_Float is
   begin
      return Ath_Sixes.Crowd_Group (Players);
   end Ath_Sixes_Crowd_Group;

   function Ath_Sixes_Crowd_Mark
     (Index : Interfaces.Integer_32;
      Players : Long_Float) return Interfaces.Integer_32 is
   begin
      if Index < 1 then
         return 0;
      end if;
      if Ath_Sixes.Crowd_Marked (Positive (Index), Players) then
         return 1;
      end if;
      return 0;
   end Ath_Sixes_Crowd_Mark;

   function Ath_Sixes_Throws_Until (Draw : Interfaces.Integer_32) return Long_Float is
   begin
      if Draw < 1 then
         return 0.0;
      end if;
      return Ath_Sixes.Throws_Until (Positive (Draw));
   end Ath_Sixes_Throws_Until;

   function Ath_Sixes_Ladder_Count return Interfaces.Integer_32 is
   begin
      return Ath_Sixes.Ladder_Count;
   end Ath_Sixes_Ladder_Count;

   function Ath_Sixes_Ladder_Players (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 or else Index > Ath_Sixes.Ladder_Count then
         return 0.0;
      end if;
      return Ath_Sixes.Ladder_Players (Positive (Index));
   end Ath_Sixes_Ladder_Players;

   function Ath_Sixes_Word (Chance : Long_Float) return Interfaces.Integer_32 is
   begin
      return Ath_Sixes.Word (Chance);
   end Ath_Sixes_Word;
end Ath_Sixes_Exports;
